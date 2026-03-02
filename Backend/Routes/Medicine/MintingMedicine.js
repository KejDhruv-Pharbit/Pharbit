import express from "express";
import { ethers } from "ethers";
import abi from "../../abi/Pharbit.json" assert { type: "json" };
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import { parse } from "csv-parse/sync";

import { FindMeds } from "../../Database/Product/Medicines/Get/FindMedicines.js";
import { getAuthUser, FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { OrgDetails } from "../../Database/Users/Organization/FindOrganization.js";
import { decrypt } from "../../Middleware/Database/EncryptDecrypt.js";
import { createBatch } from "../../Database/Transfer/Batches/CreateBatch.js";

dotenv.config();
const router = express.Router();

const upload = multer({ dest: "uploads/" });

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

const generateMetadataHash = (medicineData) => {
    const payload = JSON.stringify({
        medicineId: medicineData._id || medicineData.id,
        name: medicineData.name,
        manufacturer: medicineData.organization_id || medicineData.org_id,
        createdAt: medicineData.created_at || medicineData.createdAt,
    });
    return ethers.keccak256(ethers.toUtf8Bytes(payload));
};

router.post("/auto-mint", upload.single("serials_csv"), async (req, res) => {
    try {
        const {
            medicineId,
            pricePerToken,
            supply,
            manufacturingDate,
            expiryDate,
            warehouseLocation,
        } = req.body;

        /* =========================
           1️⃣ AUTH
        ========================== */
        const authUser = await getAuthUser(req);


        if (!authUser) return res.status(401).json({ error: "Unauthorized" });

        const orgResult = await FindOrganization(authUser.id);
        if (!orgResult.success)
            return res.status(404).json({ error: orgResult.error });

        const meds = await FindMeds(medicineId);
        if (!meds || !meds.data)
            return res.status(404).json({ error: "Medicine not found" });

        if (meds.data.organization_id !== orgResult.data.id) {
            return res.status(403).json({
                error: "You don't own this medicine record",
            });
        }

        /* =========================
           2️⃣ WALLET DECRYPTION
        ========================== */

        console.log("REQ BODY:", req.body);
        console.log("REQ FILE:", req.file);
        const organizationData = await OrgDetails(orgResult.data.id);

        const encryptionPayload = {
            content: organizationData.wallet_encrypted,
            iv: organizationData.wallet_iv,
            tag: organizationData.wallet_tag,
        };

        const privateKey = decrypt(encryptionPayload);
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            abi.abi || abi,
            signer
        );

        /* =========================
           3️⃣ BLOCKCHAIN MINT
        ========================== */
        const metadataHash = generateMetadataHash(meds.data);

        const tx = await contract.mintBatch(
            BigInt(supply),
            BigInt(pricePerToken || 0),
            metadataHash
        );

        const receipt = await tx.wait();

        const eventSignature = contract.interface.getEvent("BatchMinted");
        const log = receipt.logs.find(
            (l) => l.topics[0] === eventSignature.topicHash
        );

        if (!log)
            throw new Error("BatchMinted event not found in logs");

        const parsedLog = contract.interface.parseLog(log);
        const blockchainBatchId = parsedLog.args.batchId.toString();

        /* =========================
           4️⃣ PARSE CSV SERIALS
        ========================== */
        let serialNumbers = [];

        if (req.file) {
            const fileContent = fs.readFileSync(req.file.path);

            const records = parse(fileContent, {
                columns: false,
                skip_empty_lines: true,
                trim: true,
            });

            serialNumbers = records.map((row) => row[0]);

            // ✅ Delete uploaded file immediately
            fs.unlinkSync(req.file.path);
        }

        /* =========================
           5️⃣ DATABASE SYNC
        ========================== */
        const batchPayload = {
            medicine_id: medicineId,
            batch_number: blockchainBatchId,
            blockchain_tx_hash: receipt.hash,
            blockchain_network: "Sepolia",
            manufacturing_date:
                manufacturingDate ||
                new Date().toISOString().split("T")[0],
            expiry_date: expiryDate,
            batch_quantity: supply,
            warehouse_location: warehouseLocation || "Main Warehouse",
            serial_numbers: serialNumbers, // 🔥 pass to createBatch
        };

        const dbResult = await createBatch(
            batchPayload,
            orgResult.data.id
        );

        if (!dbResult.success) {
            return res.status(dbResult.status).json(dbResult);
        }

        return res.status(200).json({
            success: true,
            message:
                "Batch minted and serial numbers uploaded successfully",
            transactionHash: receipt.hash,
            batchId: blockchainBatchId,
            serial_count: serialNumbers.length,
            dbRecord: dbResult.data,
        });

    } catch (error) {
        console.error("Server-Side Minting Error:", error);
        res.status(500).json({
            error: "Blockchain execution failed: " + error.message,
        });
    }
});

export default router;