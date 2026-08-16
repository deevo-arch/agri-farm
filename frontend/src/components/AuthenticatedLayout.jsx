import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import Logo from './Logo'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/farm', label: 'Farm' },
  { to: '/livestock', label: 'Livestock' },
  { to: '/treatments', label: 'Treatments' },
  { to: '/milk-batches', label: 'Milk Batches' },
  { to: '/qr-codes', label: 'QR Codes' },
]

export default function AuthenticatedLayout() {
  const { name, role, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      {menuOpen && <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Logo />
        </div>
        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
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
            <div className="topbar__user-info">
              <span className="topbar__user-name">{name}</span>
              <span className="topbar__user-role">{role?.toLowerCase()}</span>
            </div>
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
