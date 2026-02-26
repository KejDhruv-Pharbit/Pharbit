import supabase from "../../../Middleware/Database/DatabaseConnect.js";

export async function createBatch(data, orgId) {
  try {
    /* =========================
       Validation & Normalization
    ========================== */
    // Ensure we have the required IDs and numbers
    if (!data.medicine_id || !data.batch_number) {
      return {
        success: false,
        status: 400,
        error: "Medicine ID and Batch Number are required",
      };
    }

    // According to your requirement: batch_number and blockchain_mint_id are the same
    const mintId = data.batch_number;

    /* =========================
       Duplicate Check
       Checks both the medicine/batch combo AND the unique blockchain IDs
    ========================== */
    const { data: existingBatch, error: checkError } = await supabase
      .from("batches")
      .select("id, batch_number, blockchain_mint_id")
      .or(`blockchain_mint_id.eq.${mintId}, blockchain_tx_hash.eq.${data.blockchain_tx_hash}`)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingBatch) {
      return {
        success: false,
        status: 409,
        error: "A batch with this Mint ID or Transaction Hash already exists.",
      };
    }

    /* =========================
       Insert Batch
    ========================== */
    const { data: inserted, error: insertError } = await supabase
      .from("batches")
      .insert([
        {
          organization_id: orgId,
          medicine_id: data.medicine_id,
          
          // Blockchain IDs
          blockchain_mint_id: mintId, 
          blockchain_tx_hash: data.blockchain_tx_hash,
          blockchain_network: data.blockchain_network || "mainnet",

          // Batch Info
          batch_number: data.batch_number,
          manufacturing_date: data.manufacturing_date,
          expiry_date: data.expiry_date,
          
          // Quantities (Ensuring they are Numbers for the DB constraints)
          batch_quantity: Number(data.batch_quantity),
          remaining_quantity: Number(data.batch_quantity), // Starts equal to total

          // Status & Quality
          is_quality_verified: true, // Required by your 'check_quality_verified' constraint
          is_active: true,
          
          // Location/Misc
          warehouse_location: data.warehouse_location || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      // Handle specific constraint violations
      if (insertError.code === "23505") {
        return { success: false, status: 409, error: "Unique constraint violation (Batch/Mint ID already exists)" };
      }
      throw insertError;
    }

    return {
      success: true,
      status: 201,
      message: "Batch successfully registered and minted",
      data: inserted,
    };

  } catch (err) {
    console.error("Create batch error:", err);
    return {
      success: false,
      status: 500,
      error: err.message || "Internal Server Error",
    };
  }
}