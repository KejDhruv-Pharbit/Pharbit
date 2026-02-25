import express from "express";
import { ethers } from "ethers";
import abi from "../../abi/Pharbit.json" assert { type: "json" };
import dotenv from 'dotenv';
import { FindMeds } from "../../Database/Product/Medicines/Get/FindMedicines.js";
import { getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { OrgDetails } from "../../Database/Users/Organization/FindOrganization.js";
import { decrypt } from "../../Middleware/Database/EncryptDecrypt.js";

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
        const { medicineId, pricePerToken, supply } = req.body;
        
        // 1. Auth & Verification
        const authUser = await getAuthUser(req);
        if (!authUser) return res.status(401).json({ error: "Unauthorized" });

        const orgResult = await FindOrganization(authUser.id);
        if (!orgResult.success) return res.status(404).json({ error: orgResult.error });

        const meds = await FindMeds(medicineId); 
        if (!meds) return res.status(404).json({ error: "Medicine not found" });

        // Ownership check
        if (meds.data.organization_id !== orgResult.data.id) {
            return res.status(403).json({ error: "You don't own this medicine record" }); 
        }

        // 2. Get Organization Details (Wallet & Encrypted Keys)
        const organizationData = await OrgDetails(orgResult.data.id);
        
        // 3. Map flattened DB columns to the object format expected by decrypt()
        // Your table columns: wallet_encrypted, wallet_iv, wallet_tag
        if (!organizationData.wallet_encrypted || !organizationData.wallet_iv || !organizationData.wallet_tag) {
            return res.status(400).json({ error: "Organization wallet keys are incomplete in database" });
        }

        const encryptionPayload = {
            content: organizationData.wallet_encrypted,
            iv: organizationData.wallet_iv,
            tag: organizationData.wallet_tag
        };

        // 4. Decrypt Private Key
        const privateKey = decrypt(encryptionPayload);
        console.log("private key " ,  privateKey); 
        // 5. Setup Provider and Signer
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi || abi, signer);

        // 6. Generate Hash & Execute Transaction
        const metadataHash = generateMetadataHash(meds.data);

        console.log(`🚀 Executing Mint for Org: ${organizationData.wallet_address}`);

        // Call the smart contract function
        const tx = await contract.mintBatch(
            BigInt(supply),
            BigInt(pricePerToken || 0), 
            metadataHash
        );

        // 7. Wait for transaction to be mined (blocks confirmation)
        const receipt = await tx.wait();

        res.status(200).json({
            success: true,
            message: "Batch minted successfully via server-side signing",
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber,
            details: {
                medicineName: meds.data.name,
                metadataHash: metadataHash,
                mintedTo: organizationData.wallet_address
            }
        });

    } catch (error) {
        console.error("Server-Side Minting Error:", error);
        res.status(500).json({ error: "Blockchain execution failed: " + error.message });
    }
});

export default router;