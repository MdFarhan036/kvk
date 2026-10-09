import { useState, useEffect } from "react";
import "./Login.css";

import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerContext.jsx";
import loginIcons from "../../assets/img/signin.gif";
import iconpass from "../../assets/img/eyeicon.jpg";
import { useTranslation } from "react-i18next";
export const CustomerLogin = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { customer, login, loading } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (!loading && customer) {
      console.log("Already logged in, redirecting to /profile");
      navigate("/profile");
    }
  }, [customer, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    console.log("handleSubmit → login attempt");

    try {
      const auth = await login(email, password);
      console.log("handleSubmit → login success", auth);

      if (auth) {
        navigate("/profile");
      } else {
        setError("Login failed: no user returned");
      }
    } catch (err) {
      console.error("handleSubmit → error", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false); // ✅ guarantees UI unlock
    }
  };
  if (loading) return <div>Checking authentication...</div>;

  return (
    <div className="login-container">


      <form className="login-form" onSubmit={handleSubmit}>
        <h1>{t("customerLogin")}</h1>
        <div className="login-icon">
          <img src={loginIcons} alt="login icon" />
        </div>

        {error && <p className="form-error">{error}</p>}
        <div className="txtb">
          <label>{t("email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="text-pass">
          <label>{t("password")}</label>
          <span className="txtb-pass">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        <div className="forgot-password">
          <Link to="/forgot-password">{t("forgotPassword")}</Link>
        </div>

        <button type="submit" className="logbtn" disabled={submitting} >
          {submitting ? t("loggingIn") : t("login")}
        </button>
        <p>
          {t("dontHaveAccount")} <Link to="/signup">{t("signUp")}</Link>
        </p>
      </form>
    </div>
  );
};
