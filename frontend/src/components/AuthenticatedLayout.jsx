import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from './Logo'

const FARMER_NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/farm', label: 'Farm' },
  { to: '/livestock', label: 'Livestock' },
  { to: '/vet-visits', label: 'Vet Visits' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/milk-batches', label: 'Milk Batches' },
  { to: '/qr-codes', label: 'QR Codes' },
  { to: '/profile', label: 'Profile' },
]

const VET_NAV_ITEMS = [
  { to: '/vet/dashboard', label: 'Dashboard' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/profile', label: 'Profile' },
]

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/profile', label: 'Profile' },
]

const DEFAULT_NAV_ITEMS = [{ to: '/dashboard', label: 'Dashboard' }]

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
              {item.label}
            </NavLink>
          ))}
        </nav>
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
