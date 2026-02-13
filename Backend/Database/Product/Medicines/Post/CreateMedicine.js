import supabase from "../../../../Middleware/Database/DatabaseConnect";

export async function createMedicine(data, orgId , files) {
  try {


     const MedicalDocsUrl = await uploadFiles(
    files?.medicineDocuments,
    "Medicine-Documents"
  );
    /* ---------------------------
       Validation
    ----------------------------*/

    if (!data.name || !data.composition || data.composition.length === 0) {
      return {
        success: false,
        status: 400,
        error: "Name and composition are required"
      };
    }

    if (!data.drug_code) {
      return {
        success: false,
        status: 400,
        error: "Drug code is required"
      };
    }

    /* ---------------------------
       Duplicate Check
    ----------------------------*/

    const { data: existing, error: findError } = await supabase
      .from("medicines")
      .select("id")
      .eq("drug_code", data.drug_code)
      .ilike("name", data.name)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return {
        success: false,
        status: 409,
        error: "Medicine with same name and drug code already exists"
      };
    }

    /* ---------------------------
       Insert Medicine
    ----------------------------*/

    const { data: inserted, error: insertError } = await supabase
      .from("medicines")
      .insert([
        {
          organization_id: orgId,

          name: data.name,
          brand_name: data.brand_name,

          composition: data.composition,
          category: data.category,

          dosage_form: data.dosage_form,
          strength: data.strength,
          route_of_administration: data.route_of_administration,

          drug_code: data.drug_code,
          hsn_code: data.hsn_code,
          schedule: data.schedule,

          approval_number: data.approval_number,
          manufacturing_license: data.manufacturing_license,

          mrp: data.mrp,
          cost_price: data.cost_price,

          storage_conditions: data.storage_conditions,
          warnings: data.warnings,
          side_effects: data.side_effects,

          legal_document_url: data.legal_document_url,

          // Verification
          is_verified: false,
          verification_status: "pending"
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    /* ---------------------------
       Success
    ----------------------------*/

    return {
      success: true,
      status: 201,
      message: "Medicine submitted for verification",
      data: inserted
    };

  } catch (err) {

    console.error("Create medicine error:", err);

    return {
      success: false,
      status: 500,
      error: err.message
    };
  }
}