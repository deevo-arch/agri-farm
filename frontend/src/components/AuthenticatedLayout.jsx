import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from './Logo'

const FARMER_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/livestock', label: 'Animal Health', icon: '🐄' },
  { to: '/farm', label: 'Farmers & Farm', icon: '👨‍🌾' },
  { to: '/milk-batches', label: 'Milk Batches', icon: '🥛' },
  { to: '/milk-quality', label: 'Milk Quality & Lab', icon: '🧪' },
  { to: '/qr-codes', label: 'QR Verification', icon: '📱' },
  { to: '/traceability', label: 'Traceability', icon: '🛤️' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
  { to: '/profile', label: 'Profile / Settings', icon: '⚙️' },
]

const VET_NAV_ITEMS = [
  { to: '/vet/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/livestock', label: 'Animal Health', icon: '🐄' },
  { to: '/treatments', label: 'Treatments & Health', icon: '💉' },
  { to: '/milk-quality', label: 'Milk Quality Tests', icon: '🧪' },
  { to: '/profile', label: 'Profile / Settings', icon: '⚙️' },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users & Roles', icon: '👥' },
  { to: '/milk-quality', label: 'Milk Quality Audit', icon: '🧪' },
  { to: '/traceability', label: 'Supply Chain Audit', icon: '🛤️' },
  { to: '/analytics', label: 'Platform Analytics', icon: '📈' },
  { to: '/profile', label: 'Profile / Settings', icon: '⚙️' },
]

const DEFAULT_NAV_ITEMS = [{ to: '/dashboard', label: 'Dashboard', icon: '📊' }]

const NAV_BY_ROLE = { FARMER: FARMER_NAV_ITEMS, VET: VET_NAV_ITEMS, ADMIN: ADMIN_NAV_ITEMS }

export default function AuthenticatedLayout() {
  const { name, role, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navItems = NAV_BY_ROLE[role] ?? DEFAULT_NAV_ITEMS

  return (
    <div className="app-shell">
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Logo />
        </div>
        
        <div style={{ padding: '0 20px 16px', fontSize: '0.725rem', color: '#059669', fontWeight: '700', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          🛡️ DairyTech Platform
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8faf4' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#054a29', lineHeight: '1.4' }}>
            “From Healthy Animals to Safe, Traceable Milk.”
          </p>
        </div>
      </aside>

      <div className="app-shell__main">
        <header className="topbar">
          <button
            type="button"
            className="topbar__menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="topbar__brand-mobile">AgriTrust</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge--success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              MongoDB Atlas Active
            </span>
          </div>

          <div className="topbar__user">
            <Link to="/profile" className="topbar__user-info">
              <span className="topbar__user-name">{name}</span>
              <span className="topbar__user-role">{role?.toLowerCase()}</span>
            </Link>
            <button type="button" className="btn btn--ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
