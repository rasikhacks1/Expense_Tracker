/**
 * pages/Dashboard.jsx
 * Main dashboard: stat cards, alert banners, charts, recent expenses.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';
import AlertBanner from '../components/AlertBanner';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { useAlerts } from '../context/AlertContext';
import { formatCurrency, getCurrentMonth, formatMonth, formatDate, truncate } from '../utils/formatters';
import { categoryService } from '../services/categoryService';

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthAlerts, setMonthAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, exp, cats, alts] = await Promise.all([
          expenseService.getSummary(selectedMonth),
          expenseService.getAll({ month: selectedMonth, limit: 5 }),
          categoryService.getAll(),
          budgetService.getAlerts(selectedMonth),
        ]);
        setSummary(s);
        setRecentExpenses(exp);
        setCategories(cats);
        setMonthAlerts(alts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedMonth]);

  const getCat = (catId) => categories.find(c => c.id === catId);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ fontSize: '2.5rem' }}
        >
          💰
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      icon: '🎯',
      label: 'Total Budget',
      value: formatCurrency(summary?.total_budget ?? 0),
      sub: `${formatMonth(selectedMonth)} budget`,
      color: 'var(--primary-light)',
    },
    {
      icon: '💸',
      label: 'Total Spent',
      value: formatCurrency(summary?.total_spent ?? 0),
      sub: summary?.total_budget ? `${((summary.total_spent / summary.total_budget) * 100).toFixed(1)}% of budget` : `${formatMonth(selectedMonth)} spent`,
      color: 'var(--danger)',
    },
    {
      icon: '💚',
      label: 'Remaining',
      value: formatCurrency(summary?.remaining ?? 0),
      sub: summary?.remaining < 0 ? '⚠️ Over budget!' : 'Available to spend',
      color: (summary?.remaining ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
    },
    {
      icon: '🔔',
      label: 'Active Alerts',
      value: `${monthAlerts.length}`,
      sub: monthAlerts.length ? `${monthAlerts.length} in ${formatMonth(selectedMonth)}` : 'All within limits',
      color: monthAlerts.length ? 'var(--warning)' : 'var(--success)',
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Month Selector Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Financial Overview
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Showing budget and expenses for <strong>{formatMonth(selectedMonth)}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>📅 Month:</span>
          <input
            type="month"
            className="form-input"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            id="dashboard-month-filter"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '28px' }}>
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} index={i} />
        ))}
      </div>

      {/* Alert Banner */}
      {monthAlerts.length > 0 && <AlertBanner alerts={monthAlerts} />}

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: '28px', gap: '20px' }}>
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ padding: '20px' }}
        >
          <div className="section-title">🍩 Spending by Category</div>
          <DonutChart data={summary?.category_breakdown ?? []} />
        </motion.div>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          style={{ padding: '20px' }}
        >
          <div className="section-title">📈 Monthly Trend</div>
          <BarChart data={summary?.monthly_trend ?? []} />
        </motion.div>
      </div>

      {/* Category Breakdown */}
      {summary?.category_breakdown?.length > 0 && (
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ padding: '20px', marginBottom: '28px' }}
        >
          <div className="section-title">🏷️ Category Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {summary.category_breakdown.map(cat => {
              const pct = cat.limit ? Math.min(100, (cat.spent / cat.limit) * 100) : null;
              const barColor = pct === null ? 'var(--primary)' : pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={cat.category_id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {cat.category_icon} {cat.category_name}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: barColor, fontWeight: 700 }}>
                      {formatCurrency(cat.spent)}{cat.limit ? ` / ${formatCurrency(cat.limit)}` : ''}
                    </span>
                  </div>
                  {pct !== null && (
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Expenses */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        style={{ padding: '20px' }}
      >
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <div className="section-title" style={{ marginBottom: 0 }}>🕐 Recent Expenses</div>
          <a href="/expenses" style={{ fontSize: '0.8rem', color: 'var(--primary-light)', textDecoration: 'none' }}>
            View all →
          </a>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-text">No expenses recorded for {formatMonth(selectedMonth)}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentExpenses.map(exp => {
              const cat = getCat(exp.category_id);
              return (
                <div key={exp.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                      background: cat ? `${cat.color}20` : 'rgba(124,58,237,0.15)',
                    }}>
                      {cat?.icon ?? '💰'}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        {truncate(exp.title, 30)}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                        {formatDate(exp.date)} · {cat?.name ?? '—'} · {exp.payment_method || 'Cash'}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.92rem', flexShrink: 0 }}>
                    {formatCurrency(exp.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
