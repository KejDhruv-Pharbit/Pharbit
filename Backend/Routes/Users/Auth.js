import express from "express";
import supabase from "../../Middleware/Database/DatabaseConnect.js";

const router = express.Router();


router.post("/auth/login", async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data?.session) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const { user, session } = data;

    res.cookie("Pharbit_Token", session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/"
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (err) {

    console.error("Login error:", err);

    return res.status(500).json({
      error: "Login failed"
    });
  }
});

export default router;