import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { createBudget, updateBudget, deleteBudget } from '../services/budgetService';
import BudgetForm from '../components/BudgetForm/BudgetForm';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '../utils/formatters';
import './Budgets.css';

export default function Budgets() {
  const { budgets, loading, error, refetch } = useBudgets();
  const { categories: budgetCategories } = useCategories('budget');
  const { categories: expenseCategories } = useCategories('expense');

  const budgetCategoryOptions = useMemo(() => {
    const names = new Map();
    [...budgetCategories, ...expenseCategories].forEach((cat) => {
      if (!names.has(cat.name)) names.set(cat.name, cat);
    });
    return [...names.values()];
  }, [budgetCategories, expenseCategories]);

  const [showForm, setShowForm] = useState(false);     
  const [editTarget, setEditTarget] = useState(null);   
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

 
  const summary = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    return { totalBudget, totalSpent };
  }, [budgets]);

  async function handleCreate(formData) {
    setIsSaving(true);
    try {
      const created = await createBudget(formData);
      toast.success(`Budget set for "${created.category}" (${created.month}).`);
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to create budget.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(formData) {
    setIsSaving(true);
    try {
      const updated = await updateBudget(editTarget.id, formData);
      toast.success(`Budget for "${updated.category}" updated.`);
      setEditTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update budget.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBudget(deleteTarget.id);
      toast.success(`Budget for "${deleteTarget.category}" deleted.`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete budget.');
    } finally {
      setIsDeleting(false);
    }
  }

  const modalOpen = showForm || Boolean(editTarget);

  return (
    <main className="budgets-page page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">
            {loading
              ? 'Loading…'
              : `${budgets.length} budget${budgets.length !== 1 ? 's' : ''} set`}
          </p>
        </div>
        {!loading && (
          <button
            className="btn-add"
            onClick={() => setShowForm(true)}
            id="add-budget-btn"
          >
            ➕ Set Budget
          </button>
        )}
      </header>

      {loading && (
        <div className="budgets-loading">
          <div className="spinner" />
          <p>Loading budgets…</p>
        </div>
      )}

      {error && !loading && (
        <div className="budgets-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && budgets.length > 0 && (
        <>
          {/* Summary */}
          <section className="budget-summary-grid" aria-label="Budget summary">
            <div className="budget-summary-card">
              <div className="budget-summary-label">Total Budgeted</div>
              <div className="budget-summary-value">
                {formatCurrency(summary.totalBudget)}
              </div>
            </div>
            <div className="budget-summary-card">
              <div className="budget-summary-label">Total Spent</div>
              <div className="budget-summary-value">
                {formatCurrency(summary.totalSpent)}
              </div>
            </div>
            <div className="budget-summary-card">
              <div className="budget-summary-label">Remaining</div>
              <div
                className={`budget-summary-value ${
                  summary.totalBudget - summary.totalSpent < 0 ? 'negative' : ''
                }`}
              >
                {formatCurrency(summary.totalBudget - summary.totalSpent)}
              </div>
            </div>
          </section>

          {/* Budget list */}
          <section className="budget-list">
            {budgets.map((budget) => {
              const percent = budget.amount > 0
                ? Math.min(100, ((budget.spent || 0) / budget.amount) * 100)
                : 0;
              const over = (budget.spent || 0) > budget.amount;

              return (
                <div key={budget.id} className={`budget-row ${over ? 'over' : ''}`}>
                  <div className="budget-row-head">
                    <div className="budget-row-title">
                      <span className="budget-icon">🎯</span>
                      <div>
                        <span className="budget-category">{budget.category}</span>
                        <span className="budget-month">{budget.month}</span>
                      </div>
                    </div>
                    <div className="budget-actions">
                      <button
                        className="btn-icon"
                        onClick={() => setEditTarget(budget)}
                        aria-label={`Edit ${budget.category} budget`}
                        id={`edit-budget-${budget.id}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon danger"
                        onClick={() => setDeleteTarget(budget)}
                        aria-label={`Delete ${budget.category} budget`}
                        id={`delete-budget-${budget.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="budget-progress-track">
                    <div
                      className="budget-progress-fill"
                      style={{ width: `${percent}%` }}
                      role="progressbar"
                      aria-valuenow={Math.round(percent)}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="budget-row-meta">
                    <span>
                      {formatCurrency(budget.spent || 0)} spent of {formatCurrency(budget.amount)}
                    </span>
                    <span className={over ? 'negative' : ''}>
                      {over
                        ? `Over by ${formatCurrency((budget.spent || 0) - budget.amount)}`
                        : `${formatCurrency(budget.amount - (budget.spent || 0))} left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}

      {!loading && !error && budgets.length === 0 && !modalOpen && (
        <div className="budgets-empty">
          <div className="empty-icon">🎯</div>
          <h2>No budgets set yet</h2>
          <p>
            Set a monthly spending limit for a category to start tracking
            against your budget.
          </p>
          <button
            className="btn-primary-link"
            onClick={() => setShowForm(true)}
            id="budgets-empty-add"
          >
            ➕ Set Your First Budget
          </button>
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => {
          setShowForm(false);
          setEditTarget(null);
        }}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title" id="budget-modal-title">
                {editTarget ? '✏️ Edit Budget' : '🎯 Set Budget'}
              </h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditTarget(null);
                }}
                aria-label="Close budget modal"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {editTarget ? (
                <BudgetForm
                  initialData={editTarget}
                  categories={budgetCategoryOptions}
                  onSubmit={handleEdit}
                  onCancel={() => setEditTarget(null)}
                  isSubmitting={isSaving}
                />
              ) : (
                <BudgetForm
                  categories={budgetCategoryOptions}
                  onSubmit={handleCreate}
                  onCancel={() => setShowForm(false)}
                  isSubmitting={isSaving}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete "${deleteTarget?.category}" budget?`}
        message={`This removes the ${deleteTarget?.month} budget for ${deleteTarget?.category}. This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isBusy={isDeleting}
      />
    </main>
  );
}