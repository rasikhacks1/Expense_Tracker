/**
 * components/BudgetForm.jsx
 * Modal form for creating and editing monthly budgets.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { budgetService } from '../services/budgetService';
import { getCurrentMonth } from '../utils/formatters';

const EMPTY = { category_id: '', month: getCurrentMonth(), limit: '' };

const BUDGET_NAMES = ['cash', 'gpay', 'card'];

export default function BudgetForm({ open, budget, categories = [], onClose, onSaved, defaultMonth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!budget;

  // Set Budget only supports three options: Cash, GPay, Card
  const budgetCategories = categories.filter(c =>
    c.is_budget || BUDGET_NAMES.includes((c.name || '').trim().toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setForm(budget
        ? { category_id: budget.category_id, month: budget.month, limit: budget.limit }
        : { ...EMPTY, month: defaultMonth || getCurrentMonth() }
      );
      setErrors({});
    }
  }, [open, budget, defaultMonth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.category_id) errs.category_id = 'Select a category';
    if (!form.month) errs.month = 'Month is required';
    if (!form.limit || isNaN(form.limit) || Number(form.limit) <= 0) errs.limit = 'Enter a valid positive limit';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, limit: parseFloat(form.limit) };
      if (isEdit) {
        await budgetService.update(budget.id, { limit: payload.limit, month: payload.month });
        toast.success('Budget updated!');
      } else {
        await budgetService.create(payload);
        toast.success('Budget set!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const selectedCat = budgetCategories.find(c => c.id === form.category_id);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{isEdit ? '✏️ Edit Budget' : '🎯 Set Budget'}</span>
              <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-budget-modal">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {budgetCategories.length === 0 ? (
                  <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: 'var(--warning)',
                    fontSize: '0.88rem',
                    textAlign: 'center',
                    lineHeight: 1.5,
                  }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>⚠️ Budget Categories Not Found</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Set Budget requires Cash, GPay, or Card categories.
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedCat && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                        borderRadius: 'var(--radius-md)', background: `${selectedCat.color}15`,
                        border: `1px solid ${selectedCat.color}30`,
                      }}>
                        <span style={{ fontSize: '1.8rem' }}>{selectedCat.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: selectedCat.color }}>{selectedCat.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget category</div>
                        </div>
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Category *</label>
                      <select id="budget-category" name="category_id" className="form-select" value={form.category_id} onChange={handleChange} disabled={isEdit}>
                        <option value="">Select a category…</option>
                        {budgetCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                        ))}
                      </select>
                      {errors.category_id && <span className="form-error">{errors.category_id}</span>}
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label className="form-label">Month *</label>
                  <input id="budget-month" name="month" type="month" className="form-input" value={form.month} onChange={handleChange} disabled={isEdit} />
                  {errors.month && <span className="form-error">{errors.month}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Limit (₹) *</label>
                  <input id="budget-limit" name="limit" type="number" step="0.01" min="0.01" className="form-input" placeholder="5000.00" value={form.limit} onChange={handleChange} />
                  {errors.limit && <span className="form-error">{errors.limit}</span>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || categories.length === 0} id="submit-budget-btn">
                  {saving ? '⏳ Saving…' : isEdit ? 'Update Budget' : 'Set Budget'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
