import express from "express";

import { FindRole, getAuthUser } from "../../Middleware/Database/AuthUser.js";
import { InviteEmployee } from "../../Database/Users/InviteEmployee.js";

const router = express.Router();

router.post("/org/invite", async (req, res) => {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return res.status(401).json({
        error: "Unauthorized"
      });
    }
    const employee = await FindRole(authUser.id);
    if (!employee) {
      return res.status(403).json({
        error: "Not an employee"
      });
    }
    if (!["manager", "owner", "admin"].includes(employee.role)) {
      return res.status(403).json({
        error: "You are not allowed to invite"
      });
    }
    const result = await InviteEmployee(
      req.body,
      employee
    );
    res.status(200).json({
      message: "Invite sent successfully",
      data: result
    });

  } catch (err) {
    console.error("Invite error:", err);
    res.status(400).json({
      error: err.message
    });
  }
}); 



export default router;