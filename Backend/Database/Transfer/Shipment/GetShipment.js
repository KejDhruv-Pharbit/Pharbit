import supabase from "../../../Middleware/Database/DatabaseConnect.js";

const FindShipment = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id,
        tracking_code,
        status,
        medicines_amount,
        created_at,

        batch:batches (
          id,
          blockchain_mint_id,
          manufacturing_date,
          expiry_date,
          is_quality_verified,

          medicines:medicine_id (
            id,
            name,
            brand_name,
            composition,
            dosage_form,
            strength,
            route_of_administration,
            drug_code,
            hsn_code,
            schedule,
            mrp,
            cost_price,
            storage_conditions,
            warnings,
            side_effects,
            category
          ),

          organization:organization_id (
            name
          )
        )
      `)
      .eq("current_holder_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("FindShipment Exception:", err.message);
    return [];
  }
};  

const FindShipmentForDestination = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id,
        tracking_code,
        status,
        medicines_amount,
        created_at,

        batch:batches (
          id,
          blockchain_mint_id,
          manufacturing_date,
          expiry_date,
          is_quality_verified,
          

          medicines:medicine_id (
            id,
            name,
            brand_name,
            composition,
            dosage_form,
            strength,
            route_of_administration,
            drug_code,
            hsn_code,
            schedule,
            mrp,
            cost_price,
            storage_conditions,
            warnings,
            side_effects,
            category
          ),

          organization:organization_id (
            name
          )
        )
      `)
      .eq("destination_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("FindShipment Exception:", err.message);
    return [];
  }
};  


const FindShipmentForSource = async (orgId) => {
  try {
    const { data, error } = await supabase
      .from("shipments")
      .select(`
        id,
        tracking_code,
        status,
        medicines_amount,
        created_at,

        batch:batches (
          id,
          blockchain_mint_id,
          manufacturing_date,
          expiry_date,
          is_quality_verified,

          medicines:medicine_id (
            id,
            name,
            brand_name,
            composition,
            dosage_form,
            strength,
            route_of_administration,
            drug_code,
            hsn_code,
            schedule,
            mrp,
            cost_price,
            storage_conditions,
            warnings,
            side_effects,
            category
          ),

          organization:organization_id (
            name
          )
        )
      `)
      .eq("source_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data;
  } catch (err) {
    console.error("FindShipment Exception:", err.message);
    return [];
  }
};  


export {
    FindShipment,
    FindShipmentForSource,
    FindShipmentForDestination 
}; 