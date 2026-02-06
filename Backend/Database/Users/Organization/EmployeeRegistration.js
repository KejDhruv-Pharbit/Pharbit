import supabase from "../../../Middleware/Database/DatabaseConnect";

export async function EmployeeRegistration({
    authId,
    orgId,
    email,
    role
}) {

    if (!authId || !orgId || !email || !role) {
        throw new Error("Missing employee fields");
    }

    const { data: existing, error: checkErr } = await supabase
        .from("employees")
        .select("id")
        .eq("auth_id", authId)
        .single();

    if (checkErr && checkErr.code !== "PGRST116") {
        throw checkErr;
    }

    if (existing) {
        throw new Error("Employee already exists");
    }

    const { data, error } = await supabase
        .from("employees")
        .insert({
            auth_id: authId,
            org_id: orgId,
            email,
            role
        })
        .select()
        .single();

    if (error) throw error;

    return data;
}