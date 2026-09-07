import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createExpense, checkBudget } from '../services/expenseService';
import { toastBudgetCheck } from '../utils/budgetAlerts';
import ExpenseForm from '../components/ExpenseForm/ExpenseForm';
import './AddExpense.css';

export default function AddExpense() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

 
  async function handleSubmit(formData) {
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const created = await createExpense(formData);
      toast.success(`"${created.title}" added successfully!`);
      setSuccessMessage(`Expense "${created.title}" was added successfully.`);

     
      try {
        const alert = await checkBudget({
          category: formData.category,
          amount: formData.amount,
          date: formData.date,
        });
        toastBudgetCheck(alert);
      } catch (err) {
       
      }

      
      setTimeout(() => navigate('/expenses'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to create expense. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/expenses');
  }

  return (
    <main className="add-expense-page page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Add Expense</h1>
          <p className="page-subtitle">Record a new expense in your tracker</p>
        </div>
        <Link to="/expenses" className="back-link" id="add-expense-back">
          ← Back to Expenses
        </Link>
      </header>

      <div className="add-expense-card">
        {/* Success Banner */}
        {successMessage && (
          <div className="success-banner" role="status" id="add-expense-success">
            ✅ {successMessage}
          </div>
        )}

        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </main>
  );
}
