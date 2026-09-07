import { formatCurrency, formatDate } from '../../utils/formatters';
import './ExpenseCard.css';


const CATEGORY_ICONS = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '⚡',
  Entertainment: '🎬',
  Health: '🏥',
  Education: '📚',
  Travel: '✈️',
  Other: '💼',
};

export default function ExpenseCard({ expense, onEdit, onDelete }) {
  const icon = CATEGORY_ICONS[expense.category] || '💼';

  return (
    <tr className="expense-card-row">
      <td>
        <div className="expense-title-cell">
          <span className="expense-category-icon">{icon}</span>
          <span className="expense-title">{expense.title}</span>
        </div>
      </td>
      <td>
        <span className="expense-amount">{formatCurrency(expense.amount)}</span>
      </td>
      <td>
        <span className="expense-category-badge">{expense.category}</span>
      </td>
      <td className="expense-description">
        {expense.description || <span className="no-description">—</span>}
      </td>
      <td className="expense-date">{formatDate(expense.date)}</td>
      <td>
        <div className="expense-actions">
          <button
            className="btn-action btn-edit"
            onClick={() => onEdit(expense)}
            id={`edit-expense-${expense.id}`}
            title="Edit expense"
          >
            ✏️ Edit
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => onDelete(expense)}
            id={`delete-expense-${expense.id}`}
            title="Delete expense"
          >
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
