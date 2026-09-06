/**
 * components/Sidebar.jsx
 * Fixed sidebar navigation with active route highlighting.
 */

import { NavLink } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊', exact: true },
  { to: '/expenses', label: 'Expenses', icon: '💸' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
];

export default function Sidebar() {
  const { dangerCount, warningCount } = useAlerts();
  const alertBadge = dangerCount + warningCount;

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>💰</span>
        <div>
          <div style={styles.logoName}>Expense Tracker</div>
          <div style={styles.logoTagline}>Smart Budgeting</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>MENU</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
            {item.label === 'Budgets' && alertBadge > 0 && (
              <span style={{
                ...styles.alertBadge,
                background: dangerCount > 0 ? 'var(--danger)' : 'var(--warning)',
              }}>
                {alertBadge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 'var(--sidebar-w)',
    height: '100vh',
    background: 'linear-gradient(180deg, #0f0f1e 0%, #0a0a14 100%)',
    borderRight: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    overflow: 'hidden',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px 20px',
    borderBottom: '1px solid var(--border-glass)',
  },
  logoIcon: {
    fontSize: '1.8rem',
    filter: 'drop-shadow(0 0 12px rgba(124,58,237,0.8))',
  },
  logoName: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  logoTagline: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navSection: {
    fontSize: '0.65rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    padding: '4px 10px 10px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '11px 14px',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: 500,
    transition: 'var(--transition)',
    position: 'relative',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(157,92,246,0.1) 100%)',
    color: 'var(--primary-light)',
    border: '1px solid rgba(124,58,237,0.25)',
  },
  navIcon: { fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' },
  navLabel: { flex: 1 },
  alertBadge: {
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'white',
    minWidth: '20px',
    textAlign: 'center',
  },
  sidebarFooter: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-glass)',
  },
  footerText: {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
  },
  footerSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    opacity: 0.6,
  },
};
