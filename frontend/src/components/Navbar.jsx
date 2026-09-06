/**
 * components/Navbar.jsx
 * Top navigation bar with current page title and alert indicator.
 */

import { useLocation } from 'react-router-dom';
import { useAlerts } from '../context/AlertContext';
import { getCurrentMonth, formatMonth } from '../utils/formatters';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your finances' },
  '/expenses': { title: 'Expenses', subtitle: 'Track every rupee you spend' },
  '/categories': { title: 'Categories', subtitle: 'Organize expenses by type' },
  '/budgets': { title: 'Budgets & Alerts', subtitle: 'Set limits and get notified' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { dangerCount, warningCount } = useAlerts();
  const page = PAGE_TITLES[pathname] || { title: 'Expense Tracker', subtitle: '' };
  const alertBadge = dangerCount + warningCount;

  return (
    <header style={styles.navbar}>
      <div>
        <h1 style={styles.title}>{page.title}</h1>
        <p style={styles.subtitle}>{page.subtitle}</p>
      </div>
      <div style={styles.right}>
        {alertBadge > 0 && (
          <div style={{
            ...styles.alertPill,
            background: dangerCount > 0
              ? 'rgba(239,68,68,0.15)'
              : 'rgba(251,191,36,0.15)',
            borderColor: dangerCount > 0
              ? 'rgba(239,68,68,0.35)'
              : 'rgba(251,191,36,0.35)',
            color: dangerCount > 0 ? 'var(--danger)' : 'var(--warning)',
          }}>
            <span>⚠️</span>
            <span>{alertBadge} budget alert{alertBadge !== 1 ? 's' : ''}</span>
          </div>
        )}
        <div style={styles.monthBadge}>
          📅 {formatMonth(getCurrentMonth())}
        </div>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 32px',
    borderBottom: '1px solid var(--border-glass)',
    background: 'rgba(10,10,20,0.8)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  alertPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid',
    fontSize: '0.8rem',
    fontWeight: 600,
    animation: 'pulse 2s infinite',
  },
  monthBadge: {
    padding: '6px 14px',
    borderRadius: '999px',
    background: 'var(--bg-glass)',
    border: '1px solid var(--border-glass)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
};
