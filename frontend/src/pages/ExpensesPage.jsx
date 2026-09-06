/**
 * pages/ExpensesPage.jsx
 * Full CRUD page for managing expenses.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../hooks/useExpenses';
import { categoryService } from '../services/categoryService';
import { expenseService } from '../services/expenseService';
import { budgetService } from '../services/budgetService';
import { useAlerts } from '../context/AlertContext';
import { getCurrentMonth, formatMonth } from '../utils/formatters';

export default function ExpensesPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
  const [filterCat, setFilterCat] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [noBudgetMonth, setNoBudgetMonth] = useState(null); // tracks month that blocked form open

  const { fetchAlerts } = useAlerts();

  const filters = {};
  if (filterMonth) filters.month = filterMonth;
  if (filterCat) filters.category_id = filterCat;

  const BUDGET_NAMES = ['cash', 'gpay', 'card'];
  const expenseCategories = categories.filter(c =>
    !c.is_budget && !BUDGET_NAMES.includes((c.name || '').trim().toLowerCase())
  );

  const { expenses, loading, refetch } = useExpenses(filters);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(console.error);
  }, []);

  const handleEdit = (exp) => { setEditTarget(exp); setShowForm(true); };
  const handleDelete = (exp) => setDeleteTarget(exp);

  // Guard: check budget exists for the selected month before opening the Add form
  const handleAddExpense = async () => {
    setEditTarget(null);
    setNoBudgetMonth(null);
    try {
      const { has_budget } = await budgetService.checkMonth(filterMonth);
      if (!has_budget) {
        setNoBudgetMonth(filterMonth);
        return;
      }
    } catch {
      // If check fails, still allow — backend will enforce
    }
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await expenseService.delete(deleteTarget.id);
      toast.success('Expense deleted');
      setDeleteTarget(null);
      refetch();
      fetchAlerts();
    } catch {
      toast.error('Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = () => { setShowForm(false); setEditTarget(null); };
  const handleSaved = () => { refetch(); fetchAlerts(); };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">{expenses.length} expense{expenses.length !== 1 ? 's' : ''} {filterMonth ? `in ${formatMonth(filterMonth)}` : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddExpense} id="add-expense-btn">
          ➕ Add Expense
        </button>
      </div>

      {/* No Budget Banner */}
      <AnimatePresence>
        {noBudgetMonth && (
          <motion.div
            key="no-budget-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              marginBottom: '16px',
              padding: '16px 20px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(239,68,68,0.08))',
              border: '1px solid rgba(251,191,36,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🚫</span>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '2px' }}>
                  No budget set for {formatMonth(noBudgetMonth)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  You must set a budget for this month before adding expenses.
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/budgets')}
                id="go-to-budgets-btn"
              >
                🎯 Set Budget
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setNoBudgetMonth(null)}
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>🔍 Filter:</span>
        <input
          type="month"
          className="form-input"
          style={{ width: 'auto', flex: '0 0 auto' }}
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setNoBudgetMonth(null); }}
          id="filter-month"
        />
        <select
          className="form-select"
          style={{ width: 'auto', flex: '0 0 auto', minWidth: '160px' }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          id="filter-category"
        >
          <option value="">All Categories</option>
          {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        {(filterMonth !== getCurrentMonth() || filterCat) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setFilterMonth(getCurrentMonth()); setFilterCat(''); }}
          >
            ✕ Reset
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ overflow: 'hidden' }}
      >
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading expenses…
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses}
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </motion.div>

      {/* Expense Form Modal */}
      <ExpenseForm
        open={showForm}
        expense={editTarget}
        categories={expenseCategories}
        onClose={handleFormClose}
        onSaved={handleSaved}
        defaultMonth={filterMonth}
      />

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteTarget(null)}>
            <motion.div className="modal-box" style={{ maxWidth: '400px' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <span className="modal-title">🗑️ Delete Expense</span>
                <button className="btn btn-ghost btn-icon" onClick={() => setDeleteTarget(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteTarget.title}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting} id="confirm-delete-expense-btn">
                  {deleting ? '⏳ Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
