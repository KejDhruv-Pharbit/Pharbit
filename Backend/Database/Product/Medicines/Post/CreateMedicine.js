import supabase from "../../../../Middleware/Database/DatabaseConnect";

export const createMedicine = async (req, res) => {
  try {

    const {
      name,
      brand_name,
      composition,
      dosage_form,
      category,
      strength,
      route_of_administration,

      // Regulatory
      drug_code,
      hsn_code,
      schedule,
      approval_number,
      manufacturing_license,

      // Pricing
      mrp,
      cost_price,

      // Safety
      storage_conditions,
      warnings,
      side_effects,

      // Legal
      legal_document_url
    } = req.body;

    const organization_id = req.user.organization_id;

    // Basic validation
    if (!name || !composition || composition.length === 0) {
      return res.status(400).json({
        error: "Name and composition are required"
      });
    }

    if (!drug_code) {
      return res.status(400).json({
        error: "Drug code is required"
      });
    }

    /* ----------------------------------
       Check if medicine already exists
    -----------------------------------*/

    const { data: existingMedicine, error: findError } = await supabase
      .from("medicines")
      .select("id")
      .eq("drug_code", drug_code)
      .maybeSingle();

    if (findError) throw findError;

    if (existingMedicine) {
      return res.status(409).json({
        success: false,
        error: "Medicine with same name and drug code already exists"
      });
    }

    /* ----------------------------------
       Insert new medicine
    -----------------------------------*/

    const { data, error } = await supabase
      .from("medicines")
      .insert([
        {
          organization_id,

          name,
          brand_name,
          composition,
          dosage_form,
          category,
          strength,
          route_of_administration,

          drug_code,
          hsn_code,
          schedule,
          approval_number,
          manufacturing_license,

          mrp,
          cost_price,

          storage_conditions,
          warnings,
          side_effects,

          legal_document_url,

          // Verification defaults
          is_verified: false,
          verification_status: "pending"
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Medicine submitted for verification",
      data
    });

  } catch (err) {

    console.error("Create medicine error:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};