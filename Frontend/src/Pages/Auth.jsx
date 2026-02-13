import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Auth.css";
import phoneimg from "../assets/Phone.png";

export default function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [signupType, setSignupType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    token: ""
  });

  /* Auto fetch token from URL */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      setIsLogin(false);
      setSignupType("employee");
      setForm((prev) => ({ ...prev, token: urlToken }));
    }
  }, []);

  /* Handle input */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* Submit Logic */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else if (signupType === "user") {
        const res = await fetch("http://localhost:5000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert("Account created. Please login.");
        setIsLogin(true);
      } else {
        const res = await fetch("http://localhost:5000/api/auth/employee-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: form.token,
            password: form.password
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert("Employee account activated.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {/* LEFT SECTION - MOCKUP */}
      <div className="auth-left">
        <div className="phone-mockup">
          <img src={phoneimg} alt="phone" className="phone-frame" />
          
          <div className="phone-screen">
            <h3>PHARBIT</h3>
            <p>Verify Your Medicine</p>
            <div className="phone-card"><span>💊 Scan Medicine</span></div>
            <div className="phone-card"><span>🔗 Token ID</span></div>
            <div className="phone-card"><span>🏪 Nearby Stores</span></div>
            <button className="phone-btn">Find Store</button>
          </div>

          <div className="circle c1">💊</div>
          <div className="circle c2">🔗</div>
          <div className="circle c3">🏪</div>
          <div className="circle c4">📍</div>
        </div>
      </div>

      {/* RIGHT SECTION - AUTH CARD */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>
            {isLogin
              ? "Welcome Back"
              : signupType === "employee"
              ? "Activate Account"
              : "Create an account"}
          </h2>
          <p className="subtitle">
            {isLogin
              ? "Login to continue to your dashboard"
              : signupType === "employee"
              ? "Use your employee token to activate your account"
              : "Create your account to get started"}
          </p>

          <div className="toggle">
            <button
              className={isLogin ? "active" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={!isLogin ? "active" : ""}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          {!isLogin && (
            <div className="signup-toggle">
              <span className={signupType === "user" ? "active" : ""}>User</span>
              <div
                className={`toggle-switch ${signupType === "employee" ? "right" : ""}`}
                onClick={() =>
                  setSignupType(signupType === "user" ? "employee" : "user")
                }
              >
                <div className="toggle-ball"></div>
              </div>
              <span className={signupType === "employee" ? "active" : ""}>
                Employee
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            )}

            {!isLogin && signupType === "user" && (
              <>
                <input
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  required
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  required
                />
              </>
            )}

            {!isLogin && signupType === "employee" && (
              <input
                name="token"
                placeholder="Employee Token"
                value={form.token}
                onChange={handleChange}
                required
              />
            )}

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            {error && <p className="error">{error}</p>}

            <button disabled={loading} className="submit-btn">
              {loading ? "Please wait..." : "Submit"}
            </button>
          </form>

          <div className="social-btns">
            <button className="social-btn"> Apple</button>
            <button className="social-btn"> Google</button>
          </div>
        </div>
      </div>
    </div>
  );
}