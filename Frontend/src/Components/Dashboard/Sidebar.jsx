import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  PowerOff,
  FileBarChart
} from "lucide-react";

import "../../Styles/Components/Sidebar.css";

const API = import.meta.env.VITE_API_BASE;

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate("/");
    }
  };

  const navItem = (to, Icon, label, end = false) => (
    <NavLink to={to} end={end} className="nav-link">
      {({ isActive }) => (
        <button className={`nav-btn ${isActive ? "active" : ""}`}>
          <Icon size={18} />
          <span>{label}</span>
        </button>
      )}
    </NavLink>
  );

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <h2>Pharbit</h2>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">

        {navItem("/Dashboard", LayoutDashboard, "Dashboard", true)}
        {navItem("/Dashboard/products", Package, "Products")}
        {navItem("/Dashboard/orders", ShoppingCart, "Orders")}
        {navItem("/Dashboard/reports", FileBarChart, "Reports")}
        {navItem("/Dashboard/settings", Settings, "Settings")}

      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <PowerOff size={18} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}