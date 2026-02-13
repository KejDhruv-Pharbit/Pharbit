import supabase from "../../../../Middleware/Database/DatabaseConnect.js";

/**
 * Verify / Approve a medicine
 * @param {string} medicineId - UUID of medicine
 * @param {string} adminId - UUID of admin (optional)
 */
export async function verifyMedicine(medicineId, adminId = null) {
  try {

    if (!medicineId) {
      return {
        success: false,
        status: 400,
        error: "Medicine ID is required"
      };
    }

    const { data: medicine, error: findError } = await supabase
      .from("medicines")
      .select("id, is_verified")
      .eq("id", medicineId)
      .single();

    if (findError || !medicine) {
      return {
        success: false,
        status: 404,
        error: "Medicine not found"
      };
    }

    if (medicine.is_verified) {
      return {
        success: false,
        status: 409,
        error: "Medicine already verified"
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from("medicines")
      .update({
        is_verified: true,
        verification_status: "approved",
        verified_at: new Date(),
        verified_by: adminId
      })
      .eq("id", medicineId)
      .select()
      .single();

    if (updateError) throw updateError;
    return {
      success: true,
      status: 200,
      message: "Medicine verified successfully",
      data: updated
    };

  } catch (err) {

    console.error("Verify medicine error:", err);

    return {
      success: false,
      status: 500,
      error: err.message
    };
  }
}