/**
 * components/AlertBanner.jsx
 * Shows budget alert banners for warning and danger states.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAlerts } from '../context/AlertContext';
import { formatCurrency, clampPercent } from '../utils/formatters';

export default function AlertBanner({ alerts: propAlerts }) {
  const { alerts: contextAlerts } = useAlerts();
  const alerts = propAlerts !== undefined ? propAlerts : contextAlerts;
  if (!alerts || alerts.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span>⚠️ Budget Alerts</span>
        <span style={styles.count}>{alerts.length} active</span>
      </div>
      <AnimatePresence>
        {alerts.map((alert) => {
          const isDanger = alert.level === 'danger';
          const color = isDanger ? 'var(--danger)' : 'var(--warning)';
          const bg = isDanger ? 'rgba(239,68,68,0.08)' : 'rgba(251,191,36,0.08)';
          const border = isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.25)';

          return (
            <motion.div
              key={alert.budget_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              style={{ ...styles.alertItem, background: bg, border: `1px solid ${border}` }}
            >
              <div style={styles.alertLeft}>
                <span style={styles.catIcon}>{alert.category_icon}</span>
                <div>
                  <div style={{ ...styles.catName, color }}>{alert.category_name}</div>
                  <div style={styles.alertMsg}>
                    {isDanger
                      ? `Over budget by ${formatCurrency(alert.spent - alert.limit)}`
                      : `${alert.percentage.toFixed(1)}% of budget used`}
                  </div>
                </div>
              </div>
              <div style={styles.alertRight}>
                <div style={styles.alertAmt}>
                  <span style={{ color }}>{formatCurrency(alert.spent)}</span>
                  <span style={styles.alertOf}> / {formatCurrency(alert.limit)}</span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${clampPercent(alert.percentage)}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  wrapper: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  count: {
    padding: '2px 10px',
    borderRadius: '999px',
    background: 'rgba(239,68,68,0.15)',
    color: 'var(--danger)',
    fontSize: '0.75rem',
    border: '1px solid rgba(239,68,68,0.3)',
  },
  alertItem: {
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  alertLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  catIcon: { fontSize: '1.3rem' },
  catName: { fontSize: '0.88rem', fontWeight: 700 },
  alertMsg: { fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' },
  alertRight: { minWidth: '160px', flex: 1, maxWidth: '220px' },
  alertAmt: { fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', textAlign: 'right' },
  alertOf: { color: 'var(--text-muted)', fontWeight: 400 },
  progressTrack: {
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '999px',
    height: '5px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 0 8px currentColor',
  },
};
