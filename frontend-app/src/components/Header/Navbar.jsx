import { useState, useEffect } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import api from "../api";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const groupedCategories = categories.reduce((acc, cat) => {
    if (!acc[cat.type]) acc[cat.type] = [];
    acc[cat.type].push(cat);
    return acc;
  }, {});

  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {/* MOBILE TOGGLE */}
      <button
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen((prev) => !prev)}
      >
        ☰
      </button>

      <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
        <ul>
          <li className="nav-item">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>



          {/* SHOP */}
          <li
            className={`nav-item dropdown ${mobileShopOpen ? "open" : ""
              }`}
            onClick={() =>
              isMobile && setMobileShopOpen((prev) => !prev)
            }
          >
            <span>Shop</span>

            <div className="mega-dropdown single-column">
              {Object.keys(groupedCategories).map((type) =>
                groupedCategories[type].map((cat) => (
                  <div className="dropdown-item" key={cat.id}>
                    <Link
                      to={`/products-categories/${cat.name}`}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileShopOpen(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </li>

          <li className="nav-item">
            <Link to="/blogs" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
          </li>

          {/* PAGES */}
          <li
            className={`nav-item dropdown ${mobilePagesOpen ? "open" : ""
              }`}
            onClick={() =>
              isMobile && setMobilePagesOpen((prev) => !prev)
            }
          >
            <span>Pages</span>

            <div className="mega-dropdown single-column">
              <div className="dropdown-item">
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </div>
              <div className="dropdown-item">
                <Link
                  to="/brands"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Brands
                </Link>
              </div>
              <div className="dropdown-item">
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>
              <div className="dropdown-item">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                >My Orders</Link>
              </div>
            </div>
          </li>

          <li className="nav-item">
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;