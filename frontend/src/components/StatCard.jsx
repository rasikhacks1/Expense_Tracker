/**
 * components/StatCard.jsx
 * Animated stat card for the dashboard summary section.
 */

import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'var(--primary)', index = 0 }) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={styles.card}
    >
      <div style={{ ...styles.iconWrap, background: `${color}20`, border: `1px solid ${color}30` }}>
        <span style={styles.icon}>{icon}</span>
      </div>
      <div style={styles.content}>
        <div style={styles.label}>{label}</div>
        <div style={{ ...styles.value, color }}>{value}</div>
        {sub && <div style={styles.sub}>{sub}</div>}
      </div>
      {/* Glow accent */}
      <div style={{ ...styles.glow, background: `radial-gradient(ellipse at top right, ${color}15 0%, transparent 70%)` }} />
    </motion.div>
  );
}

const styles = {
  card: {
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '1.4rem',
  },
  icon: { lineHeight: 1 },
  content: { flex: 1, minWidth: 0 },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '4px',
  },
  value: {
    fontSize: '1.4rem',
    fontWeight: 800,
    lineHeight: 1.2,
    wordBreak: 'break-word',
  },
  sub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
  },
  glow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
};
