import supabase from "../../../Middleware/Database/DatabaseConnect.js";
import { createShipmentLog } from "./Logs/CreateShipmentLog.js";
import { OrgDetails } from "../../Users/Organization/FindOrganization.js";

export async function ReturnShipment(shipmentId,tracking_code , orgId) {
  try {

    if (!shipmentId || !orgId) {
      return {
        success: false,
        status: 400,
        error: "Shipment ID and Organization ID are required",
      };
    }

    /* =========================
       1️⃣ Fetch Shipment
    ========================== */
    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", shipmentId)
      .single();

    if (error || !shipment) {
      return {
        success: false,
        status: 404,
        error: "Shipment not found",
      };
    }

    /* =========================
       2️⃣ Validate Shipment Status
    ========================== */

    if (shipment.status !== "RECALLING") {
      return {
        success: false,
        status: 400,
        error: "Shipment is not in recalling state",
      };
    }
      
       if (shipment.tracking_code !== tracking_code) {
      return {
        success: false,
        status: 400,
        error: "Wrong Tracking Code",
      };
    }

    if (shipment.redeemed) {
      return {
        success: false,
        status: 400,
        error: "Shipment already returned",
      };
    }

    /* =========================
       3️⃣ Fetch Batch
    ========================== */

    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("blockchain_mint_id")
      .eq("id", shipment.batch_id)
      .single();

    if (batchError || !batch) {
      return {
        success: false,
        status: 404,
        error: "Batch not found",
      };
    }

    /* =========================
       4️⃣ Update Shipment Status
    ========================== */

    const { data: updatedShipment, error: updateError } = await supabase
      .from("shipments")
      .update({
        status: "RETURNED",
        redeemed: true,
        current_holder_org_id: shipment.source_org_id,
        updated_at: new Date(),
      })
      .eq("id", shipmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    /* =========================
       5️⃣ Organization Details
    ========================== */

    const org = await OrgDetails(orgId);

    if (!org) {
      throw new Error("Organization not found");
    }

    /* =========================
       6️⃣ Create Shipment Log
    ========================== */

    await createShipmentLog({
      shipment_id: shipmentId,
      organization_id: orgId,
      location: org.address || null,
      action: "RETURNED",
      notes: `Shipment returned to manufacturer warehouse`,
    });

    return {
      success: true,
      status: 200,
      message: "Shipment returned successfully",
      batch_blockchain_id: batch.blockchain_mint_id,
      amount: shipment.amount,
      data: updatedShipment,
    };

  } catch (err) {

    console.error("Return shipment error:", err);

    return {
      success: false,
      status: 500,
      error: err.message || "Internal Server Error",
    };
  }
}