import crypto from "crypto";
import supabase from "../../../Middleware/Database/DatabaseConnect.js";
import { createShipmentLog } from "./Logs/CreateShipmentLog.js";

export async function createShipment(data, orgId) {
  try {
    if (!data.batch_id || !data.destination_org_id || !data.medicines_amount) {
      return {
        success: false,
        status: 400,
        error: "Batch ID, destination org, and medicines_amount are required",
      };
    }

    /* =========================
       1️⃣ Fetch Batch
    ========================== */
    const { data: batch, error: batchError } = await supabase
      .from("batches")
      .select("id, is_active, remaining_quantity, expiry_date")
      .eq("id", data.batch_id)
      .single();

    if (batchError || !batch) {
      return { success: false, status: 404, error: "Batch not found" };
    }

    if (!batch.is_active) {
      return { success: false, status: 400, error: "Batch is inactive." };
    }

    if (new Date(batch.expiry_date) < new Date()) {
      return { success: false, status: 400, error: "Batch has expired." };
    }

    const requestedAmount = Number(data.medicines_amount);

    if (batch.remaining_quantity < requestedAmount) {
      return {
        success: false,
        status: 400,
        error: "Insufficient remaining quantity in batch",
      };
    }

    /* =========================
       2️⃣ Deduct Quantity
    ========================== */
    const { error: updateError } = await supabase
      .from("batches")
      .update({
        remaining_quantity: batch.remaining_quantity - requestedAmount,
      })
      .eq("id", data.batch_id);

    if (updateError) throw updateError;

    /* =========================
       3️⃣ Create Shipment
    ========================== */
    const trackingCode = crypto.randomUUID();

    const { data: shipment, error: shipmentError } = await supabase
      .from("shipments")
      .insert([
        {
          batch_id: data.batch_id,
          tracking_code: trackingCode,
          source_org_id: orgId,
          destination_org_id: data.destination_org_id,
          current_holder_org_id: orgId,
          next_expected_holder_org_id: data.intermediate_id || null,
          status: "CREATED",
          escrowed: true,
          redeemed: false,
          is_active: true,
          deposit_tx_hash: data.deposit_tx_hash || null,
          redeem_tx_hash: null,
          medicines_amount: requestedAmount,
        },
      ])
      .select()
      .single();

    if (shipmentError) throw shipmentError;

    /* =========================
       4️⃣ Fetch Organization Address (JSONB)
    ========================== */
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("address")
      .eq("id", orgId)
      .single();

    if (orgError) throw orgError;

    const orgAddress = organization?.address || null;

    /* =========================
       5️⃣ Create Shipment Log
    ========================== */
    await createShipmentLog({
      shipment_id: shipment.id,
      organization_id: orgId,
      action: "CREATED",
      location: orgAddress,  // ✅ Passing JSONB as-is
      notes: "Shipment created and escrow initiated",
    });

    return {
      success: true,
      status: 201,
      message: "Shipment created successfully",
      tracking_code: shipment.tracking_code,
      data: shipment,
    };

  } catch (err) {
    console.error("Create shipment error:", err);
    return {
      success: false,
      status: 500,
      error: err.message || "Internal Server Error",
    };
  }
}