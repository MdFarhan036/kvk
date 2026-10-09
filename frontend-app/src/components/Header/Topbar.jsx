import "./Topbar.css";
import { Link } from "react-router-dom";
import LanguageSwitcher from "../LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Topbar = () => {
  const { t } = useTranslation();
  return (
    <div className="topbar">
      <div className="topbar-container">

        {/* LEFT */}
        <div className="topbar-left">
          <i className="fa-solid fa-location-dot"></i>
          <span>{t("deliveringIndia")}</span>
        </div>

        {/* CENTER */}
        <div className="topbar-center">
          <i className="fa-solid fa-truck-fast"></i>
          <span>{t("freeShipping")}</span>
        </div>

        {/* RIGHT */}
        <div className="topbar-right">
          <LanguageSwitcher />

          <a href="tel:+919308270123" className="topbar-item">
            <i className="fa-solid fa-phone"></i>
            <span>+91 7488210403</span>
          </a>

          <a
            href="https://wa.me/919308270123"
            target="_blank"
            rel="noopener noreferrer"
            className="topbar-item"
          >
            <i className="fa-brands fa-whatsapp"></i>
            <span>WhatsApp</span>
          </a>

          <Link to="/trackmyorder" className="topbar-item">
            <i className="fa-solid fa-truck"></i>
            <span>{t("trackOrder")}</span>
          </Link>

        </div>

      </div>
    </div>
  );
};