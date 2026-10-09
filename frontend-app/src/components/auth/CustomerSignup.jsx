// src/components/auth/CustomerSignup.jsx
import { useState } from "react";
import "./Login.css";
import loginIcons from "../../assets/img/signin.gif";
import iconpass from "../../assets/img/eyeicon.jpg";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";

// 🔥 use axios instance (auto env baseURL)

export const CustomerSignup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 👁️ toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ⭐ Updated signup handler using API instance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/customer/signup", form);

      if (res.data.success) {
        setSuccess(t("signupSuccess"));
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.data.message || t("signupFailed"));
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || t("signupFailed"));
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{t("customerSignup")}</h2>

        <div className="login-icon">
          <img src={loginIcons} alt="login icon" />
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="txtb">
          <input
            name="name"
            placeholder={t("name")}
            onChange={handleChange}
            required
          />
        </div>

        <div className="txtb">
          <input
            name="email"
            type="email"
            placeholder={t("email")}
            onChange={handleChange}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="text-pass">
          <span className="txtb-pass">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              onChange={handleChange}
              required
            />

            <span
              className="toggle-pass"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <img src={iconpass} alt="toggle visibility" />
            </span>
          </span>
        </div>

        <div className="txtb">
          <input name="mobile" placeholder={t("mobile")} onChange={handleChange} />
        </div>

        <div className="txtb">
          <input name="address" placeholder={t("address")} onChange={handleChange} />
        </div>

        <div className="txtb">
          <input name="city" placeholder={t("city")} onChange={handleChange} />
        </div>

        <div className="txtb">
          <input name="state" placeholder={t("state")} onChange={handleChange} />
        </div>

        <div className="txtb">
          <input name="pincode" placeholder={t("pincode")} onChange={handleChange} />
        </div>

        {success && <p className="success">{success}</p>}

        <button className="logbtn" type="submit">
          Sign Up
        </button>

        <p>
          {t("alreadyHaveAccount")} <Link to="/login">{t("login")}</Link>
        </p>
      </form>
    </div>
  );
};
