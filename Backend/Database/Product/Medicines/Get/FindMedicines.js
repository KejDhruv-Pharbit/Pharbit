import supabase from "../../../../Middleware/Database/DatabaseConnect.js";

const FindMedicine = async (status) => {
  if (!status) {
    throw new Error("Verification status is required");
  }

  const { data, error } = await supabase
    .from("medicines")
    .select(`
      id,
      organization_id,
      name,
      brand_name,
      composition,
      dosage_form,
      strength,
      route_of_administration,
      drug_code,
      hsn_code,
      schedule,
      manufacturing_license,
      approval_number,
      legal_document_url,
      is_verified,
      verified_by,
      verified_at,
      mrp,
      cost_price,
      storage_conditions,
      warnings,
      side_effects,
      is_active,
      created_at,
      updated_at,
      category,
      verification_status,
      organization:organization_id (
        name
      )
    `)
    .eq("verification_status", status);

  if (error) throw error;
  return data;
};


const FindOrganizationMeds = async (orgId) => {
  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("organization_id", orgId);

  if (error) throw error;
  return data;
};


const FindOrganizationMedsEmployee = async (orgId, userId, role) => {
  if (!orgId) {
    throw new Error("Organization ID is required");
  }

  if (!role) {
    throw new Error("Role is required");
  }

  let query = supabase
    .from("medicines")
    .select("*")
    .eq("organization_id", orgId);

  if (role === "employee") {
    query = query.eq("verified_by", userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};


const FindMeds = async (id) => {
  if (!id) {
    throw new Error("Medicine ID is required");
  }

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      success: false,
      status: 404,
      error: "Medicine not found"
    };
  }

  return {
    success: true,
    status: 200,
    data
  };
};


export {
  FindMedicine,
  FindMeds,
  FindOrganizationMeds,
  FindOrganizationMedsEmployee
};