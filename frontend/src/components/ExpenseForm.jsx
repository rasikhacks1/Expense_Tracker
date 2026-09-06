

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { expenseService } from '../services/expenseService';
import { getCurrentMonth } from '../utils/formatters';

const EMPTY = { title: '', amount: '', category_id: '', payment_method: 'Cash', date: '', note: '' };

const BUDGET_NAMES = ['cash', 'gpay', 'card'];

function toInputDate(dateStr) {
  if (!dateStr) return new Date().toISOString().slice(0, 10);
  return new Date(dateStr).toISOString().slice(0, 10);
}

export default function ExpenseForm({ open, expense, categories = [], onClose, onSaved, defaultMonth }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!expense;

  // Normal categories that are for expenses (exclude Cash, GPay, Card)
  const expenseCategories = categories.filter(c =>
    !c.is_budget && !BUDGET_NAMES.includes((c.name || '').trim().toLowerCase())
  );

  useEffect(() => {
    if (open) {
      if (expense) {
        setForm({
          title: expense.title || '',
          amount: expense.amount || '',
          category_id: expense.category_id || '',
          payment_method: expense.payment_method || 'Cash',
          date: toInputDate(expense.date),
          note: expense.note || '',
        });
      } else {
        const todayMonth = new Date().toISOString().slice(0, 7);
        const initialDate = (defaultMonth && defaultMonth !== todayMonth)
          ? `${defaultMonth}-01`
          : new Date().toISOString().slice(0, 10);
        setForm({
          ...EMPTY,
          payment_method: 'Cash',
          date: initialDate,
        });
      }
      setErrors({});
    }
  }, [open, expense, defaultMonth]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.category_id) errs.category_id = 'Select an expense category';
    if (!form.date) errs.date = 'Date is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        payment_method: form.payment_method || 'Cash',
        date: new Date(form.date).toISOString(),
      };
      if (isEdit) {
        await expenseService.update(expense.id, payload);
        toast.success('Expense updated!');
      } else {
        await expenseService.create(payload);
        toast.success('Expense added!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-box"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <span className="modal-title">{isEdit ? '✏️ Edit Expense' : '➕ Add Expense'}</span>
              <button className="btn btn-ghost btn-icon" onClick={onClose} id="close-expense-modal">✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input id="expense-title" name="title" className="form-input" placeholder="e.g. Team lunch" value={form.title} onChange={handleChange} />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Amount (₹) *</label>
                    <input id="expense-amount" name="amount" type="number" step="0.01" min="0.01" className="form-input" placeholder="0.00" value={form.amount} onChange={handleChange} />
                    {errors.amount && <span className="form-error">{errors.amount}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input id="expense-date" name="date" type="date" className="form-input" value={form.date} onChange={handleChange} />
                    {errors.date && <span className="form-error">{errors.date}</span>}
                  </div>
                </div>
                {expenseCategories.length === 0 ? (
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
                    <p style={{ fontWeight: 600, marginBottom: '8px' }}>⚠️ No Expense Categories Found</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Please create an expense category (e.g. Food, Transportation) first.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => { onClose(); navigate('/categories'); }}
                      id="go-to-categories-expense-btn"
                    >
                      🏷️ Go to Categories Page
                    </button>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Category (For Expense) *</label>
                    <select id="expense-category" name="category_id" className="form-select" value={form.category_id} onChange={handleChange}>
                      <option value="">Select an expense category…</option>
                      {expenseCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                    {errors.category_id && <span className="form-error">{errors.category_id}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Payment Method (Tracked in Budgets) *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'Cash', icon: '💵', label: 'Cash' },
                      { id: 'GPay', icon: '📱', label: 'GPay' },
                      { id: 'Card', icon: '💳', label: 'Card' },
                    ].map(m => {
                      const active = (form.payment_method || 'Cash').toLowerCase() === m.id.toLowerCase();
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, payment_method: m.id }))}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: active ? '2px solid var(--primary-light)' : '1px solid var(--border-glass)',
                            background: active ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                            color: active ? '#fff' : 'var(--text-secondary)',
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
                          <span>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <textarea id="expense-note" name="note" className="form-textarea" placeholder="Add a note…" value={form.note} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving || expenseCategories.length === 0} id="submit-expense-btn">
                  {saving ? '⏳ Saving…' : isEdit ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
