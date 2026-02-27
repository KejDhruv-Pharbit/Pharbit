import crypto from "crypto";
import supabase from "../../../Middleware/Database/DatabaseConnect.js";
import { createShipmentLog } from "./Logs/CreateShipmentLog.js";

export async function PassShipment(data, orgId) {
  try {
    const { shipment_id, next_holder_org_id, temperature  } = data;

    if (!shipment_id || !next_holder_org_id) {
      return {
        success: false,
        status: 400,
        error: "Shipment ID and next holder are required",
      };
    }

    /* =========================
       1️⃣ Fetch Shipment
    ========================== */
    const { data: shipment, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("id", shipment_id)
      .single();

    if (error || !shipment) {
      return { success: false, status: 404, error: "Shipment not found" };
    }

    if (!shipment.is_active || shipment.redeemed) {
      return {
        success: false,
        status: 400,
        error: "Shipment is inactive or already redeemed",
      };
    }

    /* =========================
       2️⃣ Validate Current Holder
    ========================== */
    if (shipment.current_holder_org_id !== orgId) {
      return {
        success: false,
        status: 403,
        error: "You are not authorized to forward this shipment",
      };
    }

    /* =========================
       3️⃣ Generate New Tracking Code
    ========================== */
    const newTrackingCode = crypto.randomUUID();

    /* =========================
       4️⃣ Update Shipment
    ========================== */
    const { data: updatedShipment, error: updateError } = await supabase
      .from("shipments")
      .update({
        tracking_code: newTrackingCode,
        next_expected_holder_org_id: next_holder_org_id,
        status: "FORWARDED",
        updated_at: new Date(),
      })
      .eq("id", shipment_id)
      .select()
      .single();

    if (updateError) throw updateError;

    /* =========================
       5️⃣ Fetch Org Address (JSONB)
    ========================== */
    const { data: org } = await supabase
      .from("organizations")
      .select("address")
      .eq("id", orgId)
      .single();

    /* =========================
       6️⃣ Create Log
    ========================== */
    await createShipmentLog({
      shipment_id,
      organization_id: orgId,
      action: "FORWARDED",
      location: org?.address || null,
      temperature: temperature || null,
      notes: `Forwarded to organization ${next_holder_org_id}`,
    });

    return {
      success: true,
      status: 200,
      message: "Shipment forwarded successfully",
      new_tracking_code: newTrackingCode,
      data: updatedShipment,
    };

  } catch (err) {
    console.error("Forward shipment error:", err);
    return {
      success: false,
      status: 500,
      error: err.message || "Internal Server Error",
    };
  }
}