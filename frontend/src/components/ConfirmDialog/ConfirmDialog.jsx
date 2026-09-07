import './ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isBusy = false,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={onCancel}
    >
      <div
        className="confirm-dialog-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-icon">🗑️</div>

        <h2 className="confirm-dialog-title" id="confirm-dialog-title">
          {title}
        </h2>

        <p className="confirm-dialog-message">{message}</p>

        <div className="confirm-dialog-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isBusy}
            id="confirm-cancel-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isBusy}
            id="confirm-delete-btn"
          >
            {isBusy ? '⏳ Deleting…' : `🗑️ ${confirmLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}