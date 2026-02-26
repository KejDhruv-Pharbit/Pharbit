import express from "express";
import { ethers } from "ethers";
import abi from "../../abi/Pharbit.json" assert { type: "json" };
import dotenv from 'dotenv';
import { FindMeds } from "../../Database/Product/Medicines/Get/FindMedicines.js";
import { getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { OrgDetails } from "../../Database/Users/Organization/FindOrganization.js";
import { decrypt } from "../../Middleware/Database/EncryptDecrypt.js";
import { createBatch } from "../../Database/Transfer/Batches/CreateBatch.js";

dotenv.config();
const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

const generateMetadataHash = (medicineData) => {
    const payload = JSON.stringify({
        medicineId: medicineData._id || medicineData.id,
        name: medicineData.name,
        manufacturer: medicineData.organization_id || medicineData.org_id,
        createdAt: medicineData.created_at || medicineData.createdAt
    });
    return ethers.keccak256(ethers.toUtf8Bytes(payload));
};
router.post('/auto-mint', async (req, res) => {
    try {
        const { medicineId, pricePerToken, supply, manufacturingDate, expiryDate, warehouseLocation } = req.body;

        // 1. Auth & Verification
        const authUser = await getAuthUser(req);
        if (!authUser) return res.status(401).json({ error: "Unauthorized" });

        const orgResult = await FindOrganization(authUser.id);
        if (!orgResult.success) return res.status(404).json({ error: orgResult.error });

        const meds = await FindMeds(medicineId);
        if (!meds || !meds.data) return res.status(404).json({ error: "Medicine not found" });

        if (meds.data.organization_id !== orgResult.data.id) {
            return res.status(403).json({ error: "You don't own this medicine record" });
        }

        // 2. Get Organization Details
        const organizationData = await OrgDetails(orgResult.data.id);

        if (!organizationData.wallet_encrypted || !organizationData.wallet_iv || !organizationData.wallet_tag) {
            return res.status(400).json({ error: "Organization wallet keys are incomplete" });
        }

        const encryptionPayload = {
            content: organizationData.wallet_encrypted,
            iv: organizationData.wallet_iv,
            tag: organizationData.wallet_tag
        };

        // 3. Decrypt & Setup Contract
        const privateKey = decrypt(encryptionPayload);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi || abi, signer);

        // 4. Execute Transaction
        const metadataHash = generateMetadataHash(meds.data);
        console.log(`🚀 Executing Mint for Org: ${organizationData.wallet_address}`);

        const tx = await contract.mintBatch(
            BigInt(supply),
            BigInt(pricePerToken || 0),
            metadataHash
        );

        // 5. Wait for transaction to be mined
        const receipt = await tx.wait();

        /* ============================================================
           NEW: EXTRACT BATCH ID FROM EVENTS & SYNC TO DATABASE
        ============================================================ */
        
        // Find the 'BatchMinted' event in the receipt logs
        const eventSignature = contract.interface.getEvent("BatchMinted");
        const log = receipt.logs.find(l => l.topics[0] === eventSignature.topicHash);
        
        if (!log) {
            throw new Error("BatchMinted event not found in transaction logs");
        }

        const parsedLog = contract.interface.parseLog(log);
        const blockchainBatchId = parsedLog.args.batchId.toString();

        // Prepare data for the createBatch function
        const batchPayload = {
            medicine_id: medicineId,
            batch_number: blockchainBatchId, // As per your requirement: batch_id = mint_id
            blockchain_tx_hash: receipt.hash,
            blockchain_network: "Sepolia",
            manufacturing_date: manufacturingDate || new Date().toISOString().split('T')[0],
            expiry_date: expiryDate,
            batch_quantity: supply,
            warehouse_location: warehouseLocation || "Main Warehouse"
        };

        // Call your DB helper
        const dbResult = await createBatch(batchPayload, orgResult.data.id);

        if (!dbResult.success) {
            return res.status(207).json({
                success: true,
                message: "Minted on blockchain, but failed to sync to database.",
                transactionHash: receipt.hash,
                dbError: dbResult.error
            });
        }

        res.status(200).json({
            success: true,
            message: "Batch minted and recorded in database successfully",
            transactionHash: receipt.hash,
            batchId: blockchainBatchId,
            dbRecord: dbResult.data
        });

    } catch (error) {
        console.error("Server-Side Minting Error:", error);
        res.status(500).json({ error: "Blockchain execution failed: " + error.message });
    }
});
export default router;