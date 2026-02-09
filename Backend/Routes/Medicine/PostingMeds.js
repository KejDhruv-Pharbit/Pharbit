import express from "express";
import { FindOrganization, getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { createMedicineService } from "../../Database/Product/Medicines/Post/CreateMedicine.js";

const router = express.Router();

router.post("/addMeds", async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const orgResult = await FindOrganization(authUser.id);
    if (!orgResult.success) {
      return res.status(404).json({
        error: orgResult.error
      });
    }

    const orgId = orgResult.data.id;
    const result = await createMedicineService(req.body, orgId);

    return res.status(result.status).json(result);

  } catch (err) {

    console.error("Add medicine error:", err);

    return res.status(500).json({
      error: "Internal server error"
    });
  }
}); 




export default router;