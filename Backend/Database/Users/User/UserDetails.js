import supabase from "../../../Middleware/Database/DatabaseConnect.js";

// ===============================
// FIND USER (EMPLOYEE OR NOT)
// ===============================
export const UserDetails = async (authId) => {
  if (!authId) {
    throw new Error("Auth ID is required");
  }

  const { data, error } = await supabase
    .from("employees")
    .select(`
      email , 
      role,
      organizations (
        name,
        type,
        wallet_address
      )
    `)
    .eq("auth_id", authId)
    .single();

  // If not found → normal user
  if (error && error.code === "PGRST116") {
    return null;
  }

  // Other DB error
  if (error) {
    throw error;
  }

  // Employee found
 return data 
};