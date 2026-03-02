import express from "express";
import { ethers } from "ethers";
import abi from "../../abi/Pharbit.json" assert { type: "json" };
import dotenv from "dotenv";

import { getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { OrgDetails } from "../../Database/Users/Organization/FindOrganization.js";
import { decrypt } from "../../Middleware/Database/EncryptDecrypt.js";
import { createShipment } from "../../Database/Transfer/Shipment/CreateShipment.js";
import { FindBatchbyId } from "../../Database/Transfer/Batches/FetchBatch.js";

dotenv.config();
const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const RPC_URL = process.env.SEPOLIA_RPC_URL;

router.post("/create-shipment", async (req, res) => {
  try {
    const { batch_id, amount, receiver_org_id, pricePerToken } = req.body;

    /* =========================
       1️⃣ AUTH
    ========================== */
    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const orgResult = await FindOrganization(authUser.id);
    if (!orgResult.success)
      return res.status(404).json({ error: orgResult.error });

    const orgId = orgResult.data.id;

    /* =========================
       2️⃣ Fetch Batch
    ========================== */
    const batch = await FindBatchbyId(batch_id);
    if (!batch.success)
      return res.status(404).json({ error: "Batch not found" });

    const blockchainBatchId = batch.data.blockchain_mint_id;

    /* =========================
       3️⃣ Get Receiver Wallet
    ========================== */
    const receiverOrg = await OrgDetails(receiver_org_id);
    if (!receiverOrg.wallet_address)
      return res.status(400).json({ error: "Receiver wallet missing" });

    const receiverAddress = receiverOrg.wallet_address;

    /* =========================
       4️⃣ Decrypt Sender Wallet
    ========================== */
    const organizationData = await OrgDetails(orgId);

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
       5️⃣ Generate courier hash
    ========================== */
    const courierPayload = JSON.stringify({
      batch_id,
      sender: orgId,
      receiver: receiver_org_id,
      timestamp: Date.now(),
    });

    const courierHash = ethers.keccak256(
      ethers.toUtf8Bytes(courierPayload)
    );

    /* =========================
       6️⃣ Call sendTokens()
    ========================== */
    const tx = await contract.sendTokens(
      BigInt(blockchainBatchId),
      BigInt(amount),
      receiverAddress,
      BigInt(pricePerToken || 0),
      courierHash
    );

    const receipt = await tx.wait();

    /* =========================
       7️⃣ Extract txId from event
    ========================== */
    const eventSignature =
      contract.interface.getEvent("TransferInitiated");

    const log = receipt.logs.find(
      (l) => l.topics[0] === eventSignature.topicHash
    );

    if (!log) {
      throw new Error("TransferInitiated event not found");
    }

    const parsedLog = contract.interface.parseLog(log);
    const blockchainTxnId = parsedLog.args.txId.toString();

    /* =========================
       8️⃣ Create Shipment (Web2)
    ========================== */
    const shipmentPayload = {
      batch_id,
      destination_org_id: receiver_org_id,
      medicines_amount: amount,
      txn_id: blockchainTxnId,
      deposit_tx_hash: receipt.hash,
    };

    const shipmentResult = await createShipment(
      shipmentPayload,
      orgId
    );

    if (!shipmentResult.success) {
      return res.status(207).json({
        success: true,
        message:
          "Tokens transferred on blockchain but shipment DB sync failed",
        blockchainTxHash: receipt.hash,
        dbError: shipmentResult.error,
      });
    }

    /* =========================
       9️⃣ Success
    ========================== */
    res.status(200).json({
      success: true,
      message: "Shipment initiated successfully",
      blockchainTxHash: receipt.hash,
      blockchainTxnId,
      shipment: shipmentResult.data,
    });

  } catch (error) {
    console.error("Shipment Initiation Error:", error);
    res.status(500).json({
      error: "Shipment initiation failed: " + error.message,
    });
  }
});

export default router;