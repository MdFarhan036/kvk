import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import "./Navbar.css";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobilePagesOpen, setMobilePagesOpen] = useState(false);

  // ============================================
  // FETCH CATEGORIES
  // ============================================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // ============================================
  // GROUP CATEGORIES
  // ============================================
  const groupedCategories = categories.reduce((acc, category) => {
    const type = category?.type || "Other";

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(category);

    return acc;
  }, {});

  // ============================================
  // CLOSE MOBILE MENU
  // ============================================
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileShopOpen(false);
    setMobilePagesOpen(false);
  };

  return (
    <>
      {/* ========================================
          MOBILE MENU BUTTON
      ======================================== */}
      <button
        type="button"
        className="mobile-toggle"
        onClick={() => setMobileMenuOpen((previous) => !previous)}
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        ☰
      </button>

      {/* ========================================
          NAVIGATION
      ======================================== */}
      <nav className={`main-nav ${mobileMenuOpen ? "open" : ""}`}>
        <ul>

          {/* HOME */}
          <li className="nav-item">
            <Link to="/" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>

          {/* ====================================
              SHOP
          ==================================== */}
          <li
            className={`nav-item dropdown ${
              mobileShopOpen ? "open" : ""
            }`}
          >
            <button
              type="button"
              className="nav-dropdown-button"
              onClick={() =>
                setMobileShopOpen((previous) => !previous)
              }
            >
              <span>Shop</span>
              <i className="fa-solid fa-chevron-down"></i>
            </button>

            <div className="mega-dropdown single-column">
              {Object.keys(groupedCategories).length > 0 ? (
                Object.keys(groupedCategories).map((type) => (
                  <div className="category-group" key={type}>
                    <div className="category-group-title">
                      {type}
                    </div>

                    {groupedCategories[type].map((category) => (
                      <div
                        className="dropdown-item"
                        key={category.id}
                      >
                        <Link
                          to={`/products-categories/${encodeURIComponent(
                            category.name
                          )}`}
                          onClick={closeMobileMenu}
                        >
                          {category.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="dropdown-item">
                  <span>No Categories Found</span>
                </div>
              )}
            </div>
          </li>

          {/* BLOG */}
          <li className="nav-item">
            <Link to="/blogs" onClick={closeMobileMenu}>
              Blog
            </Link>
          </li>

          {/* ====================================
              PAGES
          ==================================== */}
          <li
            className={`nav-item dropdown ${
              mobilePagesOpen ? "open" : ""
            }`}
          >
            <button
              type="button"
              className="nav-dropdown-button"
              onClick={() =>
                setMobilePagesOpen((previous) => !previous)
              }
            >
              <span>Pages</span>
              <i className="fa-solid fa-chevron-down"></i>
            </button>

            <div className="mega-dropdown single-column">

              <div className="dropdown-item">
                <Link to="/about" onClick={closeMobileMenu}>
                  About Us
                </Link>
              </div>

              <div className="dropdown-item">
                <Link to="/brands" onClick={closeMobileMenu}>
                  Brands
                </Link>
              </div>

              <div className="dropdown-item">
                <Link to="/contact" onClick={closeMobileMenu}>
                  Contact
                </Link>
              </div>

              <div className="dropdown-item">
                <Link to="/profile" onClick={closeMobileMenu}>
                  My Account
                </Link>
              </div>

              <div className="dropdown-item">
                <Link to="/orders" onClick={closeMobileMenu}>
                  My Orders
                </Link>
              </div>

              <div className="dropdown-item">
                <Link to="/wishlist" onClick={closeMobileMenu}>
                  Wishlist
                </Link>
              </div>

            </div>
          </li>

          {/* CONTACT */}
          <li className="nav-item">
            <Link to="/contact" onClick={closeMobileMenu}>
              Contact
            </Link>
          </li>

        </ul>
      </nav>
    </>
  );
};

export default Navbar;
