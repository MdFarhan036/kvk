import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import loginIcons from "../../assets/img/signin.gif";
import iconpass from "../../assets/img/eyeicon.jpg";
import "./Login.css";
import { customerSignUp } from "../api"; // ✅ your backend API call

export const SignUp = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    cpassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle field updates
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.cpassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await customerSignUp({
        ...form,
        role: "customer", // ✅ enforce customer role
      });
      setSuccess(res.data.message || "Signup successful!");
      setError("");

      // redirect after success
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || "Signup failed");
      setSuccess("");
    }
  };

  return (
    <div className="login-container">
      <div className="login-page">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Customer Sign Up</h1>

          <div className="login-icon">
            <img src={loginIcons} alt="login" />
          </div>

          {/* Alerts */}
          {error && <p className="error-text">{error}</p>}
          {success && <p className="success-text">{success}</p>}

          {/* Name */}
          <div className="txtb">
            <label>Name</label>
            <input
              className="input-text"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div className="txtb">
            <label>Email</label>
            <input
              className="input-text"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Mobile */}
          <div className="txtb">
            <label>Mobile</label>
            <input
              className="input-text"
              type="number"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter mobile number"
            />
          </div>

          {/* Address */}
          <div className="txtb">
            <label>Address</label>
            <input
              className="input-text"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>

          {/* Password */}
          <div className="text-pass">
            <label>Password</label>
            <span className="txtb-pass">
              <input
                className="input-text"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
              <span onClick={() => setShowPassword((p) => !p)}>
                <img src={iconpass} alt="toggle visibility" />
              </span>
            </span>
          </div>

          {/* Confirm Password */}
          <div className="text-pass">
            <label>Confirm Password</label>
            <span className="txtb-pass">
              <input
                className="input-text"
                type={showConfirmPassword ? "text" : "password"}
                name="cpassword"
                value={form.cpassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              <span onClick={() => setShowConfirmPassword((p) => !p)}>
                <img src={iconpass} alt="toggle visibility" />
              </span>
            </span>
          </div>

          <button type="submit" className="logbtn">
            Sign Up
          </button>

          <p>
            Already have an account?{" "}
            <Link to="/login">
              <span className="span-login">Login</span>
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
