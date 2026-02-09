import supabase from "./DatabaseConnect.js";

export const getAuthUser = async (req) => {
    const token = req.cookies?.Pharbit_Token;
    if (!token) throw new Error("Unauthorized");
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
};




export const FindUser = async (userId) => {
    const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("auth_id", userId)
        .single();

    if (error) throw error;
    console.log(data);
    return data;
};


export const FindOrganization = async (userId) => {
  try {

    /* -----------------------------
       Get Organization ID
    ------------------------------*/

    const { data: employee, error: empError } = await supabase
      .from("employees")
      .select("org_id")
      .eq("auth_id", userId)
      .single();

    if (empError || !employee) {
      throw new Error("Employee not linked to any organization");
    }

    /* -----------------------------
       Get Organization Details
    ------------------------------*/

    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", employee.org_id)
      .single();

    if (orgError || !organization) {
      throw new Error("Organization not found");
    }

    /* -----------------------------
       Success
    ------------------------------*/

    return {
      success: true,
      data: organization
    };

  } catch (err) {

    console.error("FindOrganization error:", err);

    return {
      success: false,
      error: err.message
    };
  }
};