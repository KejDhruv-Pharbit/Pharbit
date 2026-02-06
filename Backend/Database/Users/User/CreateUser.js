import supabase from "../../../Middleware/Database/DatabaseConnect.js";

export async function createAuthUser(email, password) {

  const { data, error } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (error) throw error;

  return data.user;
}