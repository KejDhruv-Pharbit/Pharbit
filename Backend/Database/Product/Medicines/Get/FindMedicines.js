import supabase from "../../../../Middleware/Database/DatabaseConnect.js";

const FindMedicine = async (status) => {

  if (status === undefined || status === null) {
    throw new Error("Verification status is required");
  }
  const { data, error } = await supabase
    .from("medicines")
    .select("*")
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


const FindMeds = async (id) => {
    
  if (!id) {
    throw new Error("Medicine ID is required");
  }

  const { data, error } = await supabase
    .from("medicines")
    .select("*")
    .eq("id", id)
    .single(); 

  if (error) throw error;

  return data;
};


export default {
  FindMedicine,
  FindMeds,
  FindOrganizationMeds
};