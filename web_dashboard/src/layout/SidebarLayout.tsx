import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileBarChart,
  LogOut,
  Settings,
  HelpCircle,
  UserCheck,
  Tag,
  ChevronDown,
  RefreshCw,
  User,
  Shield,
  Sprout,
  Stethoscope,
  Activity,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  Key
} from "lucide-react";
import { useAuthContext, UserRole } from "../context/AuthContext";
import { getAvatarUrl, getLocalSvgAvatar } from "../utils/avatarGenerator";
import { validateAndRedeemAdminCode } from "../services/adminInviteService";
import ParticleText from "../components/ParticleText";
import ProfileRoleModal from "../components/ProfileRoleModal";
import { CustomToast, ToastConfig } from "../components/CustomToast";
import BorderGlow from "../components/BorderGlow";
import Scanner from "../components/Scanner";

import "../styles/SidebarLayout.css";

export default function SidebarLayout() {
  const navigate = useNavigate();
  const { user, activeRole, switchActiveRole, updateAccountRole, logout } = useAuthContext();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [targetAccountRole, setTargetAccountRole] = useState<UserRole>(user?.role || 'authority');
  const [sidebarAvatarIndex, setSidebarAvatarIndex] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState("");
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const currentRole: UserRole = activeRole || user?.role || 'authority';

  const handleRoleSwitch = (newRole: UserRole) => {
    switchActiveRole(newRole);
    setIsRoleDropdownOpen(false);
  };

  const handleApplyAccountRoleChange = () => {
    if (targetAccountRole === 'authority' && user?.role !== 'authority') {
      const res = validateAndRedeemAdminCode(adminCodeInput, user?.email || '');
      if (!res.success) {
        setToast({
          type: 'error',
          title: 'Admin Code Required',
          message: res.message
        });
        return;
      }
      updateAccountRole('authority');
      setToast({
        type: 'success',
        title: 'Admin Code Redeemed',
        message: '🎉 12-digit invite code validated! Account upgraded to Authority Admin.'
      });
      setIsProfileModalOpen(false);
      setAdminCodeInput('');
      return;
    }

    updateAccountRole(targetAccountRole);
    setToast({
      type: 'success',
      title: 'Account Role Updated',
      message: `Primary account role switched to ${targetAccountRole.toUpperCase()}.`
    });
    setIsProfileModalOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'farmer':
        return { label: 'Farmer Workspace', short: 'Farmer', emoji: '🌾', class: 'role-theme-farmer', icon: Sprout };
      case 'vet':
        return { label: 'Veterinarian Portal', short: 'Veterinarian', emoji: '🩺', class: 'role-theme-vet', icon: Stethoscope };
      case 'authority':
      default:
        return { label: 'Admin Authority', short: 'Admin', emoji: '🛡️', class: 'role-theme-admin', icon: Shield };
    }
  };

  const badgeInfo = getRoleBadge(currentRole);
  const accountBadgeInfo = getRoleBadge(user?.role || 'authority');

  return (
    <div className="layout">
      {/* REACT BITS SCANNER WEBGL SHADER BACKGROUND FOR ALL AUTHENTICATED PAGES */}
      <div className="scanner-bg-layer">
        <Scanner
          color1="#e8f5e9"
          color2="#4ade80"
          color3="#1a6b38"
          speed={0.4}
          sweepSpeed={0.2}
          sweepWidth={2.0}
          sweepFalloff={8}
          scale={1.5}
          frequency={1.5}
          ripple={0.15}
          bandDensity={8}
          lineSharpness={5.0}
          glow={0.15}
          scanDirection="vertical"
          colorSpread={0.5}
          brightness={1.2}
          contrast={1.1}
          softness={1.5}
          vignette={0.2}
          scanline={true}
          grain={true}
          grainIntensity={0.03}
          opacity={0.8}
          mouseInteraction={true}
          mouseRadius={0.6}
          mouseStrength={0.4}
        />
      </div>
      <div className="layout-container">
      {/* NEUMORPHIC GRAPHIC-RICH SIDEBAR CONTROL PANEL */}
      <aside className="sidebar neu-card">
        {/* Logo Section with React Bits ParticleText Branding */}
        <div className="logo-section neu-card">
          <div className="logo-particle-wrap">
            <ParticleText
              text="Agri Farm"
              particleSize={1.8}
              density={3}
              color="#1a2e1a"
              highlightColor="#2d8f4e"
              scatter={100}
              gatherDuration={1200}
              stagger={250}
              pointerRepel={30}
              repelRadius={80}
              idleDrift={0.5}
              trigger="hover"
              fontSize="1.5rem"
              fontWeight={800}
              fontFamily="inherit"
              glow
            />
          </div>
        </div>

        {/* User Account & Role Badge Card */}
        <div className="user-graphic-card neu-inset">
          <div className="user-avatar-row">
            <div
              className="avatar-chip neu-btn"
              onClick={() => setSidebarAvatarIndex(prev => (prev + 1) % 5)}
              title="Click to cycle avatar color"
              style={{ cursor: 'pointer' }}
            >
              <div
                className="sidebar-initials-avatar"
                style={{
                  background: [
                    'linear-gradient(135deg, #2d8f4e 0%, #1a6b38 100%)',
                    'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                    'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    'linear-gradient(135deg, #059669 0%, #065f46 100%)'
                  ][sidebarAvatarIndex % 5]
                }}
              >
                {(user?.fullName || user?.email?.split('@')[0] || 'N')[0].toUpperCase()}
              </div>
              <span className="online-indicator"></span>
            </div>
            <div className="user-details">
              <span className="user-display-name">{user?.fullName || 'System User'}</span>
              <span className="user-email-text">{user?.email || 'admin@amu.gov'}</span>
            </div>
          </div>



          {/* NEUMORPHIC ROLE SWITCHER CONTROL - ADMIN ONLY */}
          {user?.role === 'authority' && (
            <div className="role-switcher-container">
              <button
                type="button"
                className="role-switcher-btn neu-btn"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              >
                <div className="role-switcher-left">
                  <span className="role-emoji">{badgeInfo.emoji}</span>
                  <div className="role-switcher-text">
                    <span className="role-caption">Active Workspace</span>
                    <span className="role-name">{badgeInfo.short}</span>
                  </div>
                </div>
                <ChevronDown size={14} className={`dropdown-arrow ${isRoleDropdownOpen ? 'open' : ''}`} />
              </button>

              {isRoleDropdownOpen && (
                <div className="role-dropdown-menu neu-card">
                  <div className="dropdown-header">Switch Active Portal View:</div>
                  <button
                    type="button"
                    className={`dropdown-item ${currentRole === 'farmer' ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch('farmer')}
                  >
                    <span>🌾 Farmer Portal</span>
                    {currentRole === 'farmer' && <span className="active-dot">•</span>}
                  </button>

                  <button
                    type="button"
                    className={`dropdown-item ${currentRole === 'vet' ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch('vet')}
                  >
                    <span>🩺 Vet Portal</span>
                    {currentRole === 'vet' && <span className="active-dot">•</span>}
                  </button>

                  <button
                    type="button"
                    className={`dropdown-item ${currentRole === 'authority' ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch('authority')}
                  >
                    <span>🛡️ Admin (Full Access)</span>
                    {currentRole === 'authority' && <span className="active-dot">•</span>}
                  </button>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item update-role-item"
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <RefreshCw size={13} />
                    <span>Change Account Type</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Menu (Filtered by Active Role + Rich Graphics) */}
        <nav className="menu">
          {/* CORE MONITORS Section */}
          <div className="menu-section">
            <div className="menu-label-gfx">
              <Activity size={12} />
              <span>CORE MONITORS</span>
            </div>

            <NavLink to="/dashboard" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
              <div className="menu-item-icon">
                <LayoutDashboard size={17} />
              </div>
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/treatments" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
              <div className="menu-item-icon">
                <ClipboardList size={17} />
              </div>
              <span>Treatment Log</span>
            </NavLink>

            {currentRole === 'authority' && (
              <NavLink to="/farmers" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
                <div className="menu-item-icon">
                  <Users size={17} />
                </div>
                <span>Farmer Records</span>
              </NavLink>
            )}

            {currentRole === 'authority' && (
              <NavLink to="/vet-records" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
                <div className="menu-item-icon">
                  <UserCheck size={17} />
                </div>
                <span>Vet Records</span>
              </NavLink>
            )}

            {currentRole === 'authority' && (
              <NavLink to="/admin-invites" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
                <div className="menu-item-icon">
                  <Key size={17} />
                </div>
                <span>Admin Invites</span>
              </NavLink>
            )}

            <NavLink to="/reports" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
              <div className="menu-item-icon">
                <FileBarChart size={17} />
              </div>
              <span>Reports & Analytics</span>
            </NavLink>
          </div>

          {/* VERIFICATION Section */}
          <div className="menu-section">
            <div className="menu-label-gfx">
              <Award size={12} />
              <span>VERIFICATION</span>
            </div>

            {(currentRole === 'authority' || currentRole === 'vet') && (
              <NavLink to="/vet-verification" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
                <div className="menu-item-icon">
                  <ShieldCheck size={17} />
                </div>
                <span>Vet Verification</span>
              </NavLink>
            )}

            {(currentRole === 'authority' || currentRole === 'farmer') && (
              <NavLink to="/farmer-verification" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
                <div className="menu-item-icon">
                  <UserCheck size={17} />
                </div>
                <span>Farmer Verification</span>
              </NavLink>
            )}
          </div>

          {/* TOOLS & PROFILE Section */}
          <div className="menu-section">
            <div className="menu-label-gfx">
              <Sparkles size={12} />
              <span>SETTINGS & PROFILE</span>
            </div>

            <button className="menu-item-gfx" onClick={() => setIsProfileModalOpen(true)}>
              <div className="menu-item-icon">
                <Settings size={17} />
              </div>
              <span>Change Account Type</span>
            </button>

            <NavLink to="/help" className={({ isActive }) => `menu-item-gfx ${isActive ? "active" : ""}`}>
              <div className="menu-item-icon">
                <HelpCircle size={17} />
              </div>
              <span>Help & Documentation</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout Button */}
        <button className="logout-btn neu-btn" onClick={handleLogout}>
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>

      {/* ACCOUNT TYPE CHANGER MODAL WITH BORDER GLOW */}
      {isProfileModalOpen && (
        <>
          <div className="profile-modal-backdrop" onClick={() => setIsProfileModalOpen(false)} />
          <div className="profile-changer-modal-wrapper">
            <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={20}>
              <div className="profile-changer-modal neu-card">
                <div className="profile-modal-header">
                  <div className="flex items-center gap-2">
                    <Settings size={20} className="text-green-600" />
                    <h3>Change Account Role Type</h3>
                  </div>
                  <button
                    type="button"
                    className="close-chip"
                    onClick={() => setIsProfileModalOpen(false)}
                    aria-label="Close modal"
                    title="Close modal"
                  >
                    <X size={20} strokeWidth={3} color="#ffffff" />
                  </button>
                </div>

                <p className="profile-modal-subtitle">
                  Re-bind your email address <strong>({user?.email})</strong> to a different primary account type:
                </p>

                <div className="account-type-cards">
                  <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
                    <div
                      className={`account-card neu-btn ${targetAccountRole === 'farmer' ? 'selected' : ''}`}
                      onClick={() => setTargetAccountRole('farmer')}
                    >
                      <div className="card-emoji">🌾</div>
                      <div className="card-details">
                        <h4>Farmer Account</h4>
                        <p>Access livestock monitoring & treatment records</p>
                      </div>
                      {targetAccountRole === 'farmer' && <CheckCircle2 size={18} className="text-emerald-400" />}
                    </div>
                  </BorderGlow>

                  <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
                    <div
                      className={`account-card neu-btn ${targetAccountRole === 'vet' ? 'selected' : ''}`}
                      onClick={() => setTargetAccountRole('vet')}
                    >
                      <div className="card-emoji">🩺</div>
                      <div className="card-details">
                        <h4>Veterinarian Account</h4>
                        <p>Access prescription verifications & vet logs</p>
                      </div>
                      {targetAccountRole === 'vet' && <CheckCircle2 size={18} className="text-emerald-600" />}
                    </div>
                  </BorderGlow>

                  <BorderGlow colors={['#2d8f4e', '#4ade80', '#16a34a']} backgroundColor="#f0f5ed" borderRadius={12}>
                    <div
                      className={`account-card neu-btn ${targetAccountRole === 'authority' ? 'selected' : ''}`}
                      onClick={() => setTargetAccountRole('authority')}
                    >
                      <div className="card-emoji">🛡️</div>
                      <div className="card-details">
                        <h4>Admin Account</h4>
                        <p>Full administrative oversight & compliance metrics</p>
                      </div>
                      {targetAccountRole === 'authority' && <CheckCircle2 size={18} className="text-emerald-600" />}
                    </div>
                  </BorderGlow>
                </div>

                {targetAccountRole === 'authority' && user?.role !== 'authority' && (
                  <div className="admin-code-box neu-inset" style={{ marginTop: '16px', padding: '14px', borderRadius: '14px', background: '#e8f0e4', border: '1px solid rgba(45, 143, 78, 0.35)' }}>
                    <label style={{ fontSize: '12px', fontWeight: 800, color: '#2d8f4e', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Key size={15} /> 12-Digit Admin Invite Code (Required for Admin Upgrade)
                    </label>
                    <input
                      type="text"
                      className="form-input neu-inset"
                      placeholder="e.g. 8921-4401-9012"
                      value={adminCodeInput}
                      onChange={e => setAdminCodeInput(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', fontSize: '14px', color: '#1a2e1a', borderRadius: '10px', background: '#f0f5ed', border: '1px solid rgba(45,143,78,0.3)', boxSizing: 'border-box' }}
                    />
                    <p style={{ fontSize: '11px', color: '#5a7a5a', margin: '6px 0 0', lineHeight: '1.4' }}>
                      Obtain an active 12-digit invite code from an ongoing Admin. Codes are valid for 5 minutes after generation.
                    </p>
                  </div>
                )}

                <div className="profile-modal-actions">
                  <button
                    type="button"
                    className="cancel-btn neu-btn"
                    onClick={() => setIsProfileModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="save-btn btn-primary-neu"
                    onClick={handleApplyAccountRoleChange}
                  >
                    Save & Update Account Type
                  </button>
                </div>
              </div>
            </BorderGlow>
          </div>
        </>
      )}

      <CustomToast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
}
