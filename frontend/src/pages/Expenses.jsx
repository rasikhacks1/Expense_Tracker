import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useExpenses } from '../hooks/useExpenses';
import { deleteExpense } from '../services/expenseService';
import ExpenseList from '../components/ExpenseList/ExpenseList';
import EditExpenseModal from '../components/EditExpenseModal/EditExpenseModal';
import DeleteConfirmation from '../components/DeleteConfirmation/DeleteConfirmation';
import './Expenses.css';

export default function Expenses() {
  const { expenses, loading, error, refetch } = useExpenses();

  const [editTarget, setEditTarget] = useState(null);     
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [isDeleting, setIsDeleting] = useState(false);

  function handleEdit(expense) {
    setEditTarget(expense);
  }

  function handleDelete(expense) {
    setDeleteTarget(expense);
  }

  
  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      toast.success(`"${deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to delete expense.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleSaved() {
    refetch();
  }

  return (
    <main className="expenses-page page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            {loading
              ? 'Loading…'
              : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''} recorded`}
          </p>
        </div>
        <Link to="/add-expense" className="btn-add" id="expenses-add-btn">
          ➕ Add Expense
        </Link>
      </header>

      {/* Expense Table — handles loading / error / empty / list states */}
      <div className="expenses-card">
        <ExpenseList
          expenses={expenses}
          loading={loading}
          error={error}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Edit Modal */}
      <EditExpenseModal
        expense={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={handleSaved}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation
        expense={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
    </main>
  );
}
