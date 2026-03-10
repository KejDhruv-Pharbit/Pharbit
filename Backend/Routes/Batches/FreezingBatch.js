import express from "express";
import dotenv from "dotenv";
import { freezeQueue } from "../../Queue/queue.js";

import { getAuthUser, FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { FindMeds } from "../../Database/Product/Medicines/Get/FindMedicines.js";

dotenv.config();
const router = express.Router();

router.post("/freeze-batch", async (req, res) => {
  try {

    const { batchId, recallReason , medicineId } = req.body;

    /* =========================
       AUTH
    ========================== */

    const authUser = await getAuthUser(req);
    if (!authUser) return res.status(401).json({ error: "Unauthorized" });

    const orgResult = await FindOrganization(authUser.id);

    if (!orgResult.success) {
      return res.status(404).json({ error: orgResult.error });
    }

    
        const meds = await FindMeds(medicineId);
    if (!meds || !meds.data)
      return res.status(404).json({ error: "Medicine not found" });

    if (meds.data.organization_id !== orgResult.data.id) {
      return res.status(403).json({
        error: "You don't own this medicine record",
      });
    }
    /* =========================
       Add job to queue
    ========================== */

    await freezeQueue.add("freezeBatch", {
      batchId,
      orgId: orgResult.data.id,
      recallReason: recallReason || "Quality recall",
    });

    return res.status(200).json({
      success: true,
      message: "Freeze request queued. Processing in background.",
    });

  } catch (error) {

    console.error("Freeze Queue Error:", error);

    res.status(500).json({
      error: "Freeze request failed: " + error.message,
    });
  }
});

export default router;