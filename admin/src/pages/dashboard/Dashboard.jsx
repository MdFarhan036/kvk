import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api"; // centralized axios instance
import "./Dashboard.css";

// ✅ ENV variables
const ASSET_BASE_URL = import.meta.env.VITE_ASSET_BASE_URL;

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalSales: 0,
    totalReturns: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [customerSummary, setCustomerSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statsRes,
        ordersRes,
        productsRes,
        customersRes,
      ] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/recent-orders?limit=10"),
        api.get("/dashboard/top-products?limit=8"),
        api.get("/dashboard/customer-summary"),
      ]);

      setStats(statsRes.data ?? {});
      setRecentOrders(ordersRes.data ?? []);
      setTopProducts(productsRes.data ?? []);
      setCustomerSummary(customersRes.data ?? []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard">
      {/* ================= STATS ================= */}
      <div className="adminproduct-body">
        <div className="adminproduct-stats">
          <Link to="/customers/customerTable" className="adminproduct-stats-card">
            <p>
              {stats.totalCustomers ?? 0}
              <br />
              <span>Total Customers</span>
            </p>
            <i className="fa fa-users box-icon"></i>
          </Link>

          <Link to="/allorders" className="adminproduct-stats-card">
            <p>
              {stats.totalOrders ?? 0}
              <br />
              <span>Total Orders</span>
            </p>
            <i className="fa fa-shopping-bag box-icon"></i>
          </Link>

          <Link to="/sales" className="adminproduct-stats-card">
            <p>
              ₹{Number(stats.totalSales || 0).toFixed(2)}
              <br />
              <span>Total Sales</span>
            </p>
            <i className="fa fa-list box-icon"></i>
          </Link>

          <Link to="/returns" className="adminproduct-stats-card">
            <p>
              {stats.totalReturns ?? 0}
              <br />
              <span>Total Returns</span>
            </p>
            <i className="fa fa-tasks box-icon"></i>
          </Link>
        </div>
      </div>

      {/* ================= DATA ================= */}
      <div className="adminproduct-data-container">
        <div className="sales-boxes">
          {/* -------- Recent Orders -------- */}
          <div className="recent-sales box">
            <div className="title">Recent Orders</div>

            {recentOrders.length === 0 ? (
              <p>No recent orders.</p>
            ) : (
              <div className="sales-details">
                <ul className="details">
                  <li className="topic">Date</li>
                  {recentOrders.map((o) => (
                    <li key={o.id}>
                      {new Date(o.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>

                <ul className="details">
                  <li className="topic">Customer</li>
                  {recentOrders.map((o) => (
                    <li key={o.id}>{o.customerName || "Unknown"}</li>
                  ))}
                </ul>

                <ul className="details">
                  <li className="topic">Status</li>
                  {recentOrders.map((o) => (
                    <li key={o.id}>{o.status}</li>
                  ))}
                </ul>

                <ul className="details">
                  <li className="topic">Total</li>
                  {recentOrders.map((o) => (
                    <li key={o.id}>
                      ₹{Number(o.totalCost || 0).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="button">
              <Link to="/orders">See All</Link>
            </div>
          </div>

          {/* -------- Top Products -------- */}
          <div className="top-sales box">
            <div className="title">Top Selling Products</div>

            {topProducts.length === 0 ? (
              <p>No top products yet.</p>
            ) : (
              <ul className="top-sales-details">
                {topProducts.map((p) => (
                  <li key={p.id}>
                    <Link to={`/products/${p.id}`}>
                      {p.image && (
                        <img
                          src={`${ASSET_BASE_URL}${p.image}`}
                          alt={p.product_name}
                        />
                      )}
                      <span className="product">{p.product_name}</span>
                    </Link>
                    <span className="price">Sold: {p.totalSold}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* -------- Customer Summary -------- */}
        <div className="customer-summary box">
          <div className="title">Customer Summary</div>

          {customerSummary.length === 0 ? (
            <p>No customers found.</p>
          ) : (
            <table className="table-customer">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerSummary.map((c) => (
                  <tr key={c.customerId}>
                    <td>{c.customerName}</td>
                    <td>{c.totalOrders}</td>
                    <td>₹{Number(c.totalSpent || 0).toFixed(2)}</td>
                    <td>
                      <Link to={`/customers/customer/${c.customerId}/orders`}>
                        View Orders
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
