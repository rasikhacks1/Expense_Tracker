/**
 * components/ExpenseTable.jsx
 * Table of expenses with edit and delete actions.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDate, truncate } from '../utils/formatters';

export default function ExpenseTable({ expenses = [], categories = [], onEdit, onDelete }) {
  const getCat = (catId) => categories.find(c => c.id === catId);

  if (!expenses.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💸</div>
        <div className="empty-state-text">No expenses yet.<br />Add your first expense to get started.</div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Expense</th>
            <th>Category</th>
            <th>Paid Via</th>
            <th>Date</th>
            <th style={{ textAlign: 'right' }}>Amount</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {expenses.map((exp) => {
              const cat = getCat(exp.category_id);
              const pm = exp.payment_method || 'Cash';
              const pmIcon = pm.toLowerCase() === 'card' ? '💳' : pm.toLowerCase() === 'gpay' ? '📱' : '💵';
              return (
                <motion.tr
                  key={exp.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                >
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {truncate(exp.title, 35)}
                    </div>
                    {exp.note && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {truncate(exp.note, 50)}
                      </div>
                    )}
                  </td>
                  <td>
                    {cat ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: `${cat.color}20`,
                        border: `1px solid ${cat.color}40`,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: cat.color,
                      }}>
                        {cat.icon} {cat.name}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-glass)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                    }}>
                      {pmIcon} {pm}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                    {formatDate(exp.date)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>
                    {formatCurrency(exp.amount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => onEdit(exp)}
                        title="Edit expense"
                        id={`edit-expense-${exp.id}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm btn-icon"
                        onClick={() => onDelete(exp)}
                        title="Delete expense"
                        id={`delete-expense-${exp.id}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}
