/**
 * pages/BudgetsPage.jsx
 * Full CRUD page for managing budgets with real-time alert status.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import BudgetForm from '../components/BudgetForm';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { useAlerts } from '../context/AlertContext';
import { formatCurrency, formatMonth, getCurrentMonth, clampPercent } from '../utils/formatters';

export default function BudgetsPage() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());

  const { alerts, fetchAlerts } = useAlerts();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, cats] = await Promise.all([
        budgetService.getAll(filterMonth),
        categoryService.getAll(),
      ]);
      setBudgets(b);
      setCategories(cats);
    } catch {
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [filterMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const BUDGET_NAMES = ['cash', 'gpay', 'card'];
  const budgetCategories = categories.filter(c =>
    c.is_budget || BUDGET_NAMES.includes((c.name || '').trim().toLowerCase())
  );
  const activeBudgets = budgets.filter(b => {
    const cat = categories.find(c => c.id === b.category_id);
    return cat && (cat.is_budget || BUDGET_NAMES.includes((cat.name || '').trim().toLowerCase()));
  });

  const totalMonthBudget = activeBudgets.reduce((sum, b) => sum + (b.limit || 0), 0);

  const getAlert = (budgetId) => alerts.find(a => a.budget_id === budgetId);
  const getCat = (catId) => categories.find(c => c.id === catId);

  const handleEdit = (b) => { setEditTarget(b); setShowForm(true); };
  const handleDelete = (b) => setDeleteTarget(b);
  const handleFormClose = () => { setShowForm(false); setEditTarget(null); };
  const handleSaved = () => { fetchData(); fetchAlerts(filterMonth); };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await budgetService.delete(deleteTarget.id);
      toast.success('Budget deleted');
      setDeleteTarget(null);
      fetchData();
      fetchAlerts(filterMonth);
    } catch {
      toast.error('Failed to delete budget');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets & Alerts</h1>
          <p className="page-subtitle">
            {formatMonth(filterMonth)} Total Budget: <strong style={{ color: 'var(--primary-light)' }}>{formatCurrency(totalMonthBudget)}</strong> ({activeBudgets.length} budget{activeBudgets.length !== 1 ? 's' : ''}: Cash · GPay · Card)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="month"
            className="form-input"
            style={{ width: 'auto' }}
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            id="budget-filter-month"
          />
          <button className="btn btn-primary" onClick={() => { setEditTarget(null); setShowForm(true); }} id="add-budget-btn">
            🎯 Set Budget
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          Loading budgets…
        </div>
      ) : activeBudgets.length === 0 ? (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '48px' }}>
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            {budgetCategories.length === 0 ? (
              <div className="empty-state-text">
                Loading budget categories (Cash, GPay, Card)…
              </div>
            ) : (
              <div className="empty-state-text">
                No budgets set for {formatMonth(filterMonth)}.<br />Set a budget for Cash, GPay, or Card to start tracking limits.
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="grid-2" style={{ gap: '16px' }}>
          <AnimatePresence>
            {activeBudgets.map((budget, index) => {
              const alert = getAlert(budget.id);
              const cat = getCat(budget.category_id);
              const spent = alert?.spent ?? 0;
              const pct = (spent / budget.limit) * 100;
              const barColor = pct >= 100 ? 'var(--danger)' : pct >= 80 ? 'var(--warning)' : 'var(--success)';
              const levelLabel = pct >= 100 ? '🔴 Over Budget' : pct >= 80 ? '🟡 Warning' : '🟢 On Track';

              return (
                <motion.div
                  key={budget.id}
                  className="glass-card"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.06 }}
                  style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}
                >
                  {/* Glow */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
                    borderRadius: '50%', background: `radial-gradient(circle, ${barColor.replace('var(--', '').replace(')', '')}18 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', fontSize: '1.4rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: cat ? `${cat.color}20` : 'rgba(124,58,237,0.15)',
                        border: cat ? `1px solid ${cat.color}40` : '1px solid rgba(124,58,237,0.3)',
                      }}>
                        {cat?.icon ?? '💰'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: cat?.color ?? 'var(--primary-light)' }}>
                          {cat?.name ?? 'Unknown'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatMonth(budget.month)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '999px', background: `${barColor}15`, color: barColor,
                      border: `1px solid ${barColor}30`,
                    }}>
                      {levelLabel}
                    </span>
                  </div>

                  {/* Amounts */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>SPENT</div>
                      <div style={{ fontWeight: 700, color: barColor, fontSize: '1.1rem' }}>{formatCurrency(spent)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>LIMIT</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{formatCurrency(budget.limit)}</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="progress-bar-track" style={{ marginBottom: '16px', height: '8px' }}>
                    <motion.div
                      className="progress-bar-fill"
                      style={{ background: barColor, boxShadow: `0 0 8px ${barColor}80` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${clampPercent(pct)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {pct.toFixed(1)}% used · {formatCurrency(Math.max(0, budget.limit - spent))} remaining
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleEdit(budget)} id={`edit-budget-${budget.id}`}>
                      ✏️ Edit
                    </button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => handleDelete(budget)} id={`delete-budget-${budget.id}`}>
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <BudgetForm open={showForm} budget={editTarget} categories={budgetCategories} onClose={handleFormClose} onSaved={handleSaved} defaultMonth={filterMonth} />

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: '400px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">🗑️ Delete Budget</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Delete the budget for <strong style={{ color: 'var(--text-primary)' }}>{formatMonth(deleteTarget?.month)}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting} id="confirm-delete-budget-btn">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
