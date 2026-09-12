import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import "../components/Header/Navbar.css";
import adminprofuserimg from "../assets/image.png";
import dashboardimg from "../assets/dashboard.png";
import checkoutimg from "../assets/checkout.png";
import settingimg from "../assets/setting.png";
import customerimg from "../assets/customer.png";
import productsimg from "../assets/products.png";
import logoutimg from "../assets/logout.png";
import adminlogo from "../assets/kvklogo1.png";
import toggleimg from "../assets/List_menu_toggle-512.webp";

// API function

export const AdminPanel = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [submenuToggle, setSubmenuToggle] = useState({});
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch users list
  useEffect(() => {
    if (!token) {
      navigate("/users/userTable");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get("/users"); // token auto-attached
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/admin/login");
        }
      }
    };

    fetchUsers();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // redirect to login
  };

  const handleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleTabClick = (index) => {
    setActiveTab(index);
    setSubmenuToggle((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (
        !e.target.closest(".admin-profile-user") &&
        !e.target.closest(".admindropdownMenu")
      ) {
        setIsOpenDropdown(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  return (
    <>
      <div className="admin-sidebar">
        <div className="admin-dashboard-head">
          <div className="admintop-head">
            {/* Left: Toggle + Logo */}
            <div className="admin-dashboard-left">
              <li className="nav-toggle" onClick={handleCollapse}>
                <img src={toggleimg} alt="Toggle Menu" />
              </li>
              <div className="admin-logo">
                <img src={adminlogo} alt="Admin Logo" />
              </div>
            </div>

            {/* Right: Profile */}
            <div className="admin-header-account">
              <div
                className="admin-profile-user"
                onClick={() => setIsOpenDropdown(!isOpenDropdown)}
              >
                <div className="admin-profile-user-img">
                  <img src={adminprofuserimg} alt="Admin" />
                </div>
                <div className="admin-profile-info">
                  <span className={`dropdown-arrow ${isOpenDropdown ? "open" : ""}`}>
                    ▼
                  </span>
                </div>
                
              </div>

              {isOpenDropdown && (
                <ul className="admindropdownMenu">
                  <li>
                    <button onClick={() => navigate("/account")}>My Account</button>
                  </li>
                  <li>
                    <button onClick={() => navigate("/settings")}>Settings</button>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className={`admin-panel ${isCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar" style={{ width: isCollapsed ? "60px" : "200px" }}>
          <ul>
            <Link to="/dashboard">
              <li className={`admin-box ${activeTab === 0 ? "activetab" : ""}`} onClick={() => handleTabClick(0)}>
                <img src={dashboardimg} alt="Dashboard" />
                {!isCollapsed && <p>Dashboard</p>}
              </li>
            </Link>

            {/* Categories */}
            <li className={`admin-box ${activeTab === 8 ? "activetab" : ""}`} onClick={() => handleTabClick(8)}>
              <img src={productsimg} alt="Categories" />
              {!isCollapsed && <p>Categories</p>}
            </li>
            {submenuToggle[8] && (
              <div className="submenu-wrapper opensubmenu">
                <ul className="admin-submenu">
                  <Link to="/categories/categoryTable"><li>Category List</li></Link>
                  <Link to="/categories/uploadCategory"><li>Category Upload</li></Link>
                </ul>
              </div>
            )}

            {/* Products */}
            <li className={`admin-box ${activeTab === 1 ? "activetab" : ""}`} onClick={() => handleTabClick(1)}>
              <img src={productsimg} alt="Products" />
              {!isCollapsed && <p>Products</p>}
            </li>
            {submenuToggle[1] && (
              <div className="submenu-wrapper opensubmenu">
                <ul className="admin-submenu">
                  <Link to="/allproducts/productTable"><li>Products List</li></Link>
                  <Link to="/allproducts/uploadProduct"><li>Products Upload</li></Link>
                </ul>
              </div>
            )}

            <Link to="/allorders">
              <li className={`admin-box ${activeTab === 2 ? "activetab" : ""}`} onClick={() => handleTabClick(2)}>
                <img src={customerimg} alt="Orders" />
                {!isCollapsed && <p>Orders</p>}
              </li>
            </Link>
            <Link to="/customers/customerTable">
              <li className={`admin-box ${activeTab === 2 ? "activetab" : ""}`} onClick={() => handleTabClick(2)}>
                <img src={customerimg} alt="Customers" />
                {!isCollapsed && <p>Customers</p>}
              </li>
            </Link>

            <Link to="/users/userTable">
              <li className={`admin-box ${activeTab === 3 ? "activetab" : ""}`} onClick={() => handleTabClick(3)}>
                <img src={checkoutimg} alt="Users" />
                {!isCollapsed && <p>Users</p>}
              </li>
            </Link>
            <Link to="/brands/brandsTable">
              <li className={`admin-box ${activeTab === 3 ? "activetab" : ""}`}>
                <img src={checkoutimg} alt="Brands" />
                {!isCollapsed && <p>Brands</p>}
              </li>
            </Link>
                  <Link to="/carousels/carouselsTable">
              <li className={`admin-box ${activeTab === 3 ? "activetab" : ""}`}>
                <img src={checkoutimg} alt="Carousels" />
                {!isCollapsed && <p>Carousels</p>}
              </li>
            </Link>
            <Link to="/transactions">
              <li className={`admin-box ${activeTab === 5 ? "activetab" : ""}`} onClick={() => handleTabClick(4)}>
                <img src={checkoutimg} alt="Transactions" />
                {!isCollapsed && <p>Transactions</p>}
              </li>
            </Link>
   

            <Link to="/settings">
              <li className={`admin-box ${activeTab === 6 ? "activetab" : ""}`} onClick={() => handleTabClick(5)}>
                <img src={settingimg} alt="Settings" />
                {!isCollapsed && <p>Settings</p>}
              </li>
            </Link>
            <Link to="/blogs">
              <li className={`admin-box ${activeTab === 6 ? "activetab" : ""}`} onClick={() => handleTabClick(6)}>
                <img src={settingimg} alt="Blogs" />
                {!isCollapsed && <p>Blogs</p>}
              </li>
            </Link>

            <li className="admin-box" onClick={handleLogout}>
              <img src={logoutimg} alt="Logout" />
              {!isCollapsed && <p>Logout</p>}
            </li>
          </ul>
        </div>

        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
