import supabase from "../../../Middleware/Database/DatabaseConnect.js";
import FindShipmentLogs from "./Logs/GetShipmentLog.js";


/* ============================================================
   BASE SHIPMENT SELECT (Shared Across All Queries)
============================================================ */

const shipmentSelect = `
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
  ),

  source_org:source_org_id (
    name
  ),

  destination_org:destination_org_id (
    name
  ),

  current_holder_org:current_holder_org_id (
    name
  )
`;
/* ============================================================
   Helper: Attach Shipment Logs
============================================================ */

const attachLogs = async (shipments) => {
  if (!shipments || shipments.length === 0) return [];

  return await Promise.all(
    shipments.map(async (shipment) => {
      const logsResult = await FindShipmentLogs(shipment.id);

      return {
        ...shipment,
        shipment_logs: logsResult.success ? logsResult.data : [],
      };
    })
  );
};

/* ============================================================
   1️⃣ Shipments Where Org Is Current Holder
============================================================ */

const FindShipment = async (orgId) => {
  try {
    if (!orgId) return [];

    const { data, error } = await supabase
      .from("shipments")
      .select(shipmentSelect)
      .eq("current_holder_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return await attachLogs(data);

  } catch (err) {
    console.error("FindShipment Exception:", err.message);
    return [];
  }
};



/* ============================================================
   1️⃣ Shipments Where Org Is Next Holder
============================================================ */



const FindIncomingShipment = async (orgId) => {
  try {
    if (!orgId) return [];

    const { data, error } = await supabase
      .from("shipments")
      .select(shipmentSelect)
      .eq("next_expected_holder_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return await attachLogs(data);

  } catch (err) {
    console.error("FindShipment Exception:", err.message);
    return [];
  }
};

/* ============================================================
   2️⃣ Shipments Where Org Is Destination
============================================================ */

const FindShipmentForDestination = async (orgId) => {
  try {
    if (!orgId) return [];

    const { data, error } = await supabase
      .from("shipments")
      .select(shipmentSelect)
      .eq("destination_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return await attachLogs(data);

  } catch (err) {
    console.error("FindShipmentForDestination Exception:", err.message);
    return [];
  }
};

/* ============================================================
   3️⃣ Shipments Where Org Is Source
============================================================ */

const FindShipmentForSource = async (orgId) => {
  try {
    if (!orgId) return [];

    const { data, error } = await supabase
      .from("shipments")
      .select(shipmentSelect)
      .eq("source_org_id", orgId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return await attachLogs(data);

  } catch (err) {
    console.error("FindShipmentForSource Exception:", err.message);
    return [];
  }
};

/* ============================================================
   EXPORTS
============================================================ */

export {
  FindShipment,
  FindShipmentForDestination,
  FindShipmentForSource,
  FindIncomingShipment
};