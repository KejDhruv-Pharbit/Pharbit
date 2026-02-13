import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Auth.css"
import phoneimg from "../assets/Phone.png"

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
      setForm(prev => ({ ...prev, token: urlToken }));
    }
  }, []);

  /* Handle input */
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {

      /* LOGIN */
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
      }


      /* USER SIGNUP */
      else if (signupType === "user") {

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
      }


      /* EMPLOYEE SIGNUP */
      else {

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


      {/* LEFT SECTION */}
      <div className="auth-left">

        <h1>PHARBIT</h1>
        <p>Medicine → Token → Find Your Store</p>

        <div className="phone-mockup">

          <img
            src={phoneimg}
            alt="phone"
          />

          {/* Floating Icons */}

          <div className="circle c1">💊</div>
          <div className="circle c2">🔗</div>
          <div className="circle c3">🏪</div>
          <div className="circle c4">📍</div>

        </div>

      </div>


      {/* RIGHT SECTION */}
      <div className="auth-right">

        <div className="auth-card">

          <h2>{isLogin ? "Sign In" : "Sign Up"}</h2>


          {/* Toggle */}
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


          {/* Signup Type */}
          {!isLogin && (
            <div className="signup-type">

              <label>
                <input
                  type="radio"
                  value="user"
                  checked={signupType === "user"}
                  onChange={() => setSignupType("user")}
                />
                User
              </label>

              <label>
                <input
                  type="radio"
                  value="employee"
                  checked={signupType === "employee"}
                  onChange={() => setSignupType("employee")}
                />
                Employee
              </label>

            </div>
          )}


          {/* Form */}
          <form onSubmit={handleSubmit}>

            {/* LOGIN EMAIL */}
            {isLogin && (
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            )}


            {/* USER SIGNUP */}
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


            {/* EMPLOYEE SIGNUP */}
            {!isLogin && signupType === "employee" && (
              <input
                name="token"
                placeholder="Employee Token"
                value={form.token}
                onChange={handleChange}
                required
              />
            )}


            {/* COMMON */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />


            {/* ERROR */}
            {error && <p className="error">{error}</p>}


            <button disabled={loading}>
              {loading ? "Please wait..." : "Submit"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}