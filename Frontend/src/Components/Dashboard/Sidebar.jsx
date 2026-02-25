import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    LayoutGrid,      // Dashboard
    Box,             // Inventory
    Layers,          // Batches
    PlusCircle,      // Add Products
    History,         // History
    LogOut,          // Logout
    ChevronLeft,
    ChevronRight,
    User
} from "lucide-react";
import "../../Styles/Components/Sidebar.css";

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { to: "/Dashboard", icon: LayoutGrid, label: "Dashboard" },
        { to: "/Dashboard/products", icon: Box, label: "Inventory" },
        { to: "/Dashboard/batches", icon: Layers, label: "Batches" },
        { to: "/Dashboard/add-product", icon: PlusCircle, label: "Add Products" },
        { to: "/Dashboard/Employee", icon: User, label: "Invite Employee" },
    ];

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
            {/* Sidebar Header with Pharbit Logo */}
            <div className="sidebar-header">
                <div className="logo-section">
                    <div className="logo-icon-box">
                        <div className="logo-symbol" />
                    </div>
                    {!isCollapsed && <span className="logo-text">Pharbit</span>}
                </div>
                <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <div className="nav-container">
                {!isCollapsed && <p className="nav-subtitle">MAIN MENU</p>}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className="nav-link">
                            {({ isActive }) => (
                                <div className={`nav-item ${isActive ? "active" : ""}`}>
                                    <item.icon className="icon-style" size={22} strokeWidth={2} />
                                    {!isCollapsed && <span className="label-text">{item.label}</span>}
                                    {item.badge && !isCollapsed && <span className="nav-badge">{item.badge}</span>}
                                    {item.badge && isCollapsed && <div className="badge-dot" />}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* Footer / Logout */}
            <div className="sidebar-footer">
                <button className="logout-action" onClick={handleLogout}>
                    <LogOut size={22} strokeWidth={2} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
}