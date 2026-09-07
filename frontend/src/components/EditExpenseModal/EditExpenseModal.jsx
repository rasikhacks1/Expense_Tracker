import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateExpense, checkBudget } from '../../services/expenseService';
import { toastBudgetCheck } from '../../utils/budgetAlerts';
import ExpenseForm from '../ExpenseForm/ExpenseForm';
import './EditExpenseModal.css';

export default function EditExpenseModal({ expense, onClose, onSaved }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!expense) return null;

 
  async function handleSubmit(formData) {
    setIsSubmitting(true);
    try {
      const updated = await updateExpense(expense.id, formData);
      toast.success(`"${updated.title}" updated successfully!`);

     
      try {
        const alert = await checkBudget({
          category: updated.category,
          amount: updated.amount,
          date: updated.date,
        });
        toastBudgetCheck(alert);
      } catch (err) {
        
      }

      onSaved(updated);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to update expense.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
      onClick={onClose}
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" id="edit-modal-title">✏️ Edit Expense</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close edit modal"
            id="edit-modal-close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <ExpenseForm
            initialData={expense}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
