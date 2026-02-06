import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import { createOrgWallet } from "../../Database/Users/Organization/AddOrganization.js";

dotenv.config();
const router = express.Router();
router.use(express.json());
router.use(cookieParser());


router.post("/organization", async (req, res) => {
    try {
        const {
            registrationId,
            organizationName,
            type
        } = req.body;

        if (!registrationId || !organizationName || !type) {
            return res.status(400).json({
                message: "registrationId, organizationName and type are required"
            });
        }

        const org = await createOrgWallet({
            registrationId,
            organizationName,
            type
        });

        return res.status(201).json({
            message: "Organization registered successfully",
            organization: {
                id: org.id,
                name: org.name,
                registrationId,
                type,
                walletAddress: org.address,
                privateKey: org.privateKey
            }
        });

    } catch (err) {
        console.error("Org signup error:", err);
        return res.status(400).json({
            error: err.message
        });
    }
});





export default router;