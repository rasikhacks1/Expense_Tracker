import ExpenseCard from '../ExpenseCard/ExpenseCard';
import './ExpenseList.css';

export default function ExpenseList({ expenses, loading, error, onEdit, onDelete }) {

  if (loading) {
    return (
      <div className="state-container" id="expenses-loading">
        <div className="spinner" aria-label="Loading expenses" />
        <p className="state-text">Loading expenses…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-container state-error" id="expenses-error">
        <span className="state-icon">⚠️</span>
        <p className="state-text">{error}</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="state-container state-empty" id="expenses-empty">
        <span className="state-icon">📭</span>
        <p className="state-text">No expenses yet.</p>
        <p className="state-subtext">Click <strong>Add Expense</strong> to record your first one.</p>
      </div>
    );
  }

  return (
    <div className="expense-list-wrapper">
      <table className="expense-table" id="expenses-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th className="th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
