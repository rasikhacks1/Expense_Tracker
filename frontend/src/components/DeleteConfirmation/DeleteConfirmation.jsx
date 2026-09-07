import './DeleteConfirmation.css';

export default function DeleteConfirmation({ expense, onConfirm, onCancel, isDeleting }) {
  if (!expense) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={onCancel}
    >
      <div
        className="delete-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-icon">🗑️</div>

        <h2 className="delete-modal-title" id="delete-modal-title">
          Delete Expense?
        </h2>

        <p className="delete-modal-message">
          You are about to permanently delete{' '}
          <strong className="expense-name-highlight">&quot;{expense.title}&quot;</strong>.
          This action cannot be undone.
        </p>

        <div className="delete-modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="delete-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="delete-confirm-btn"
          >
            {isDeleting ? '⏳ Deleting…' : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
