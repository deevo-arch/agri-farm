import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileBarChart,
  LogOut,
  ShieldCheck,
  Settings,
  HelpCircle,
  UserCheck,
  Tag   
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

// Use neumorphic layout CSS
import "../styles/SidebarLayout.css";

export default function SidebarLayout() {
  const navigate = useNavigate();

  // Logout handler
  const logout = () => {
    localStorage.removeItem("amu_auth");
    navigate("/");
  };

  return (
    <div className="layout-container">
      <ThemeToggle />
      
      {/* ✅ NEUMORPHIC SIDEBAR CONTROL PANEL */}
      <aside className="sidebar">
        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-icon">
            <ShieldCheck size={26} strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <h2 className="app-title">Agri Farm</h2>
            <p className="logo-subtitle">Monitoring Portal</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="menu">
          {/* MENU Section */}
          <div className="menu-section">
            <div className="menu-label">CORE MONITORS</div>
            <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/treatments" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <ClipboardList size={18} />
              <span>Treatment Log</span>
            </NavLink>

            <NavLink to="/farmers" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <Users size={18} />
              <span>Farmer Records</span>
            </NavLink>

            <NavLink to="/vet-records" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <UserCheck size={18} />
              <span>Vet Records</span>
            </NavLink>

            <NavLink to="/reports" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <FileBarChart size={18} />
              <span>Reports</span>
            </NavLink>
          </div>

          {/* VERIFICATION Section */}
          <div className="menu-section">
            <div className="menu-label">VERIFICATION</div>
            <NavLink to="/vet-verification" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <ShieldCheck size={18} />
              <span>Vet Verification</span>
            </NavLink>

            <NavLink to="/farmer-verification" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <UserCheck size={18} />
              <span>Farmer Verification</span>
            </NavLink>

            <NavLink to="/animal-verification" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
              <Tag size={18} />
              <span>Animal Verification</span>
            </NavLink>
          </div>

          {/* TOOLS Section */}
          <div className="menu-section">
            <div className="menu-label">TOOLS</div>
            <button className="menu-item" onClick={() => alert("Settings panel configuration loaded.")}>
              <Settings size={18} />
              <span>Settings</span>
            </button>

            <button className="menu-item" onClick={() => alert("Help Center & Documentation.")}>
              <HelpCircle size={18} />
              <span>Help & Support</span>
            </button>
          </div>
        </nav>

        {/* Logout Button */}
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
