import { useState, useEffect } from 'react';
import './BudgetForm.css';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const EMPTY_FORM = {
  category: '',
  amount: '',
  month: currentMonth(),
};

export default function BudgetForm({ initialData, categories, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        category: initialData.category || '',
        amount: initialData.amount ?? '',
        month: initialData.month || currentMonth(),
      });
      setErrors({});
    } else {
      setFormData(EMPTY_FORM);
      setErrors({});
    }
  }, [initialData]);

  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nextErrors = {};
    if (!formData.category) nextErrors.category = 'Category is required.';
    if (formData.amount === '' || isNaN(Number(formData.amount))) {
      nextErrors.amount = 'Amount is required.';
    } else if (Number(formData.amount) <= 0) {
      nextErrors.amount = 'Amount must be greater than 0.';
    }
    const monthValid = /^\d{4}-(0[1-9]|1[0-2])$/.test(formData.month);
    if (!formData.month || !monthValid) {
      nextErrors.month = 'Month must be in YYYY-MM format.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      category: formData.category,
      amount: Number(formData.amount),
      month: formData.month,
    });
  }

  const isEditMode = Boolean(initialData);

  return (
    <form className="budget-form" onSubmit={handleSubmit} noValidate>
      {/* Category */}
      <div className="form-group">
        <label className="form-label" htmlFor="budget-category">
          Category <span className="required">*</span>
        </label>
        <select
          id="budget-category"
          className={`form-select ${errors.category ? 'input-error' : ''}`}
          value={formData.category}
          onChange={(e) => setField('category', e.target.value)}
          disabled={isEditMode}
        >
          <option value="">— Select a budget category —</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <span className="field-error" role="alert">{errors.category}</span>}
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label" htmlFor="budget-amount">
          Monthly Limit (₹) <span className="required">*</span>
        </label>
        <input
          id="budget-amount"
          type="number"
          step="0.01"
          min="0.01"
          className={`form-input ${errors.amount ? 'input-error' : ''}`}
          placeholder="e.g. 10000"
          value={formData.amount}
          onChange={(e) => setField('amount', e.target.value)}
        />
        {errors.amount && <span className="field-error" role="alert">{errors.amount}</span>}
      </div>

      {/* Month */}
      <div className="form-group">
        <label className="form-label" htmlFor="budget-month">
          Month <span className="required">*</span>
        </label>
        <input
          id="budget-month"
          type="month"
          className={`form-input ${errors.month ? 'input-error' : ''}`}
          value={formData.month}
          onChange={(e) => setField('month', e.target.value)}
        />
        {errors.month && <span className="field-error" role="alert">{errors.month}</span>}
      </div>

      {/* Actions */}
      <div className="budget-form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          id="budget-form-submit"
        >
          {isSubmitting
            ? 'Saving…'
            : (isEditMode ? '💾 Save Changes' : '➕ Set Budget')}
        </button>
      </div>
    </form>
  );
}