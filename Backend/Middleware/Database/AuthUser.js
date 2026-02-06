import supabase from "./DatabaseConnect";

export const getAuthUser = async (req) => {
    const token = req.cookies?.Pharbit_Token;
    if (!token) throw new Error("Unauthorized");
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return data.user;
};

export const FindRole = async (userId) => {
    const { data, error } = await supabase
        .from("employees")
        .select("role")
        .eq("auth_id", userId)
        .single();

    if (error) throw error;

    return data.role;
};
