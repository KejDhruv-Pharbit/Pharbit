import { Wallet } from "ethers";
import { encrypt, decrypt } from "../../../Middleware/Database/EncryptDecrypt.js";
import supabase from "../../../Middleware/Database/DatabaseConnect.js";

// ===============================
// CREATE ORG + WALLET (SAFE)
// ===============================

export async function createOrgWallet(data) {

  // 1️⃣ Check if organization already exists
  const { data: existingOrg, error: fetchError } = await supabase
    .from("organizations")
    .select("id, wallet_address")
    .eq("registrationId", data.registrationId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  // If org exists
  if (existingOrg) {
    // If wallet already exists → stop
    if (existingOrg.wallet_address) {
      throw new Error("Organization already has a wallet");
    }

    throw new Error("Organization already exists");
  }

  // 2️⃣ Generate wallet
  const wallet = Wallet.createRandom();

  // 3️⃣ Encrypt private key
  const encrypted = encrypt(wallet.privateKey);

  // 4️⃣ Insert into DB
  const { data: newOrg, error } = await supabase
    .from("organizations")
      .insert({
      registrationId : data.registrationId , 
      name: data.organizationName,
      type: data.type,
      wallet_address: wallet.address,
      wallet_encrypted: encrypted.content,
      wallet_iv: encrypted.iv,
      wallet_tag: encrypted.tag
    })
    .select()
    .single();

  if (error) throw error;

  // 5️⃣ Return (DEV ONLY: privateKey)
  return {
    id: newOrg.id,
    name: data.organizationName,
    address: wallet.address,

    // Remove in production
    privateKey:
      process.env.NODE_ENV === "development"
        ? wallet.privateKey
        : undefined
  };
}