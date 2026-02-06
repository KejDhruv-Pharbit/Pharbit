import supabase from "../../../Middleware/Database/DatabaseConnect.js";

export async function createAuthUser(
  email,
  password,
  firstName,
  lastName
) {

  if (!email || !password || !firstName || !lastName) {
    throw new Error("Missing user fields");
  }

  const fullName = `${firstName} ${lastName}`;

  const { data, error } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,

      // 👇 This controls Display Name in Supabase
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        name: fullName // (extra compatibility)
      }
    });

  if (error) throw error;

  return data.user;
}