import supabase from "../../../Middleware/Database/DatabaseConnect.js";

export async function freezeBatch(batchMintId, orgId, recallReason = null) {
  try {

    /* =========================
       Validate Input
    ========================== */

    if (!batchMintId) {
      return {
        success: false,
        status: 400,
        error: "Batch Mint ID is required",
      };
    }

    /* =========================
       Fetch Batch (minimal fields)
    ========================== */

    const { data: batch, error: fetchError } = await supabase
      .from("batches")
      .select("id, organization_id, is_active")
      .eq("blockchain_mint_id", batchMintId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!batch) {
      return {
        success: false,
        status: 404,
        error: "Batch not found",
      };
    }

    /* =========================
       Ownership Check
    ========================== */

    if (batch.organization_id !== orgId) {
      return {
        success: false,
        status: 403,
        error: "Unauthorized: You do not own this batch",
      };
    }

    /* =========================
       Prevent Double Freeze
    ========================== */

    if (!batch.is_active) {
      return {
        success: false,
        status: 409,
        error: "Batch already frozen",
      };
    }

    /* =========================
       Freeze Batch (atomic update)
    ========================== */

    const { data: updated, error: updateError } = await supabase
      .from("batches")
      .update({
        is_active: false,
        is_recalled: true,
        recall_reason: recallReason?.trim() || null,
        recalled_at: new Date(),
        updated_at: new Date(),
      })
      .eq("blockchain_mint_id", batchMintId)
      .eq("is_active", true) // prevents race condition
      .select()
      .maybeSingle();

    if (updateError) throw updateError;

    if (!updated) {
      return {
        success: false,
        status: 409,
        error: "Batch already frozen or updated by another process",
      };
    }

    /* =========================
       Success Response
    ========================== */

    return {
      success: true,
      status: 200,
      message: "Batch successfully frozen and recalled",
      data: updated,
    };

  } catch (err) {

    console.error("Freeze batch error:", err);

    return {
      success: false,
      status: 500,
      error: err.message || "Internal Server Error",
    };
  }
}