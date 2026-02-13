import express from "express";
import { FindMedicine, FindOrganizationMeds } from "../../Database/Product/Medicines/Get/FindMedicines.js";
import { FindOrganization, FindRole, getAuthUser } from "../../Middleware/Database/AuthUser.js";

const router = express.Router();

router.get("/medicines", async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const { status } = req.query;
    if (!status) {
      return res.status(400).json({
        error: "Status query param is required"
      });
    }
    if (status === "pending") {
        const roleResult = await FindRole(authUser.id);
        console.log(roleResult); 
      if (!roleResult?.role) {
        return res.status(403).json({
          error: "Role not found"
        });
      }

      if (roleResult.role !== "admin") {
        return res.status(403).json({
          error: "Admin access required"
        });
      }
    }
    const medicines = await FindMedicine(status);
    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });

  } catch (err) {

    console.error("Error fetching medicines:", err);

    return res.status(500).json({
      error: "Failed to fetch medicines"
    });
  }
}); 



router.get("/Orgmeds", async (req, res) => {
  try {

    const authUser = await getAuthUser(req);

    if (!authUser) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }

    const orgdata = await FindOrganization(authUser.id);

    if (!orgdata || !orgdata.data) {
      return res.status(404).json({
        error: "Organization not found"
      });
    }
      console.log(orgdata); 
    if (orgdata.role !== "manager") {
      return res.status(403).json({
        error: "Only Manager can access the Meds"
      });
    }

    const orgId = orgdata.data.org_id || orgdata.data.id;
    const medicines = await FindOrganizationMeds(orgId);

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines
    });

  } catch (err) {

    console.error("Error fetching medicines:", err);

    return res.status(500).json({
      error: "Failed to fetch medicines"
    });
  }
});




export default router;