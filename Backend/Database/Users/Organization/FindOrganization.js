import supabase from "../../../Middleware/Database/DatabaseConnect.js"; 

export const OrgDetails = async (OrgId) => {
  if (!OrgId) {
    throw new Error("Auth ID is required");
  }
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", OrgId)
    .single();

  if (error) {
    throw error;
  }

  // Employee found
 return data 
};