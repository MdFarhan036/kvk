import "./Topbar.css";
import { Link } from "react-router-dom";

export const Topbar = () => {
  return (
    <div className="topbar">
      <div className="topbar-container">

        {/* LEFT */}
        <div className="topbar-left">
          <i className="fa-solid fa-location-dot"></i>
          <span>Delivering across India</span>
        </div>

        {/* CENTER */}
        <div className="topbar-center">
          <i className="fa-solid fa-truck-fast"></i>
          <span>Free Shipping on orders above ₹999</span>
        </div>

        {/* RIGHT */}
        <div className="topbar-right">

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
            <span>Track Order</span>
          </Link>

        </div>

      </div>
    </div>
  );
};