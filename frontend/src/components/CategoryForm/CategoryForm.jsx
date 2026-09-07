import { useState } from 'react';
import './CategoryForm.css';

export default function CategoryForm({
  initialName = '',
  submitLabel = 'Add',
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Category name is required.');
      return;
    }
    if (trimmed.length > 50) {
      setError('Category name must be 50 characters or fewer.');
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <form className="category-form" onSubmit={handleSubmit} noValidate>
      <input
        className="form-input category-form-input"
        type="text"
        placeholder="e.g. Groceries"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError('');
        }}
        maxLength={50}
        autoFocus
        id="category-name-input"
      />
      <div className="category-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          id="category-submit-btn"
        >
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
      {error && <span className="field-error" role="alert">{error}</span>}
    </form>
  );
}