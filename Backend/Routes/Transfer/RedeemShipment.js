import express from "express";
import dotenv from "dotenv";

import { getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { FindOrganization } from "../../Middleware/Database/AuthUser.js";
import { redeemShipment } from "../../Database/Transfer/Shipments/RedeemShipment.js";

dotenv.config();
const router = express.Router();

/* ============================================================
   POST /redeem-shipment
============================================================ */

router.post("/redeem-shipment", async (req, res) => {
    try {
        const { shipment_id } = req.body;

        if (!shipment_id) {
            return res.status(400).json({
                success: false,
                error: "Shipment ID is required",
            });
        }

        /* =========================
           1️⃣ AUTH
        ========================== */
        const authUser = await getAuthUser(req);
        if (!authUser) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        }

        const orgResult = await FindOrganization(authUser.id);
        if (!orgResult.success) {
            return res.status(404).json({
                success: false,
                error: orgResult.error,
            });
        }

        const orgId = orgResult.data.id;

        /* =========================
           2️⃣ Call Redeem Logic
        ========================== */
        const result = await redeemShipment({ shipment_id }, orgId);

        if (!result.success) {
            return res.status(result.status || 400).json({
                success: false,
                error: result.error,
            });
        }

        /* =========================
           3️⃣ Success Response
        ========================== */
        return res.status(200).json({
            success: true,
            message: result.message,
            blockchain_redeem_tx: result.blockchain_redeem_tx,
            shipment: result.data,
        });

    } catch (error) {
        console.error("Redeem Shipment Route Error:", error);
        return res.status(500).json({
            success: false,
            error: "Server error: " + error.message,
        });
    }
});

export default router;