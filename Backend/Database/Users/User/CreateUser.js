import supabase from "../../../Middleware/Database/DatabaseConnect";

export async function createAuthUser(email, password) {

  const { data, error } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (error) throw error;

  return data.user; 
}