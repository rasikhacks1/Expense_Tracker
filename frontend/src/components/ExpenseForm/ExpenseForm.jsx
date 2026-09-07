import { useState, useEffect } from 'react';
import { validateField, validateExpenseForm, CATEGORIES } from '../../utils/validation';
import { useCategories } from '../../hooks/useCategories';
import './ExpenseForm.css';

const EMPTY_FORM = {
  title: '',
  amount: '',
  category: '',
  description: '',
  date: '',
};

export default function ExpenseForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  
  const { categories: liveCategories, loading: categoriesLoading } = useCategories('expense');
  const categoryOptions = categoriesLoading
    ? CATEGORIES
    : (liveCategories.length > 0 ? liveCategories.map((c) => c.name) : CATEGORIES);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount ?? '',
        category: initialData.category || '',
        description: initialData.description || '',
        date: initialData.date ? initialData.date.slice(0, 10) : '',
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData(EMPTY_FORM);
      setErrors({});
      setTouched({});
    }
  }, [initialData]);


  function handleChange(e) {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);


    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }


  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  
  async function handleSubmit(e) {
    e.preventDefault();

  
    const allTouched = Object.fromEntries(Object.keys(EMPTY_FORM).map((k) => [k, true]));
    setTouched(allTouched);

    const { errors: formErrors, isValid } = validateExpenseForm(formData);
    setErrors(formErrors);

    if (!isValid) return;

    
    const payload = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      description: formData.description.trim() || null,
      date: formData.date,
    };

    await onSubmit(payload);
  }

  const isEditMode = Boolean(initialData);

  return (
    <form className="expense-form" onSubmit={handleSubmit} noValidate>
      {/* Title */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-title">
          Title <span className="required">*</span>
        </label>
        <input
          id="field-title"
          name="title"
          type="text"
          className={`form-input ${errors.title && touched.title ? 'input-error' : ''}`}
          placeholder="e.g. Lunch at restaurant"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={100}
          autoFocus
        />
        {errors.title && touched.title && (
          <span className="field-error" role="alert">{errors.title}</span>
        )}
      </div>

      {/* Amount */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-amount">
          Amount (₹) <span className="required">*</span>
        </label>
        <input
          id="field-amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          className={`form-input ${errors.amount && touched.amount ? 'input-error' : ''}`}
          placeholder="e.g. 250"
          value={formData.amount}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.amount && touched.amount && (
          <span className="field-error" role="alert">{errors.amount}</span>
        )}
      </div>

      {/* Category */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-category">
          Category <span className="required">*</span>
        </label>
        <select
          id="field-category"
          name="category"
          className={`form-select ${errors.category && touched.category ? 'input-error' : ''}`}
          value={formData.category}
          onChange={handleChange}
          onBlur={handleBlur}
        >
          <option value="">— Select a category —</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && touched.category && (
          <span className="field-error" role="alert">{errors.category}</span>
        )}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-description">
          Description <span className="optional">(optional)</span>
        </label>
        <textarea
          id="field-description"
          name="description"
          className="form-textarea"
          placeholder="Any additional details…"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={500}
        />
      </div>

      {/* Date */}
      <div className="form-group">
        <label className="form-label" htmlFor="field-date">
          Date <span className="required">*</span>
        </label>
        <input
          id="field-date"
          name="date"
          type="date"
          className={`form-input ${errors.date && touched.date ? 'input-error' : ''}`}
          value={formData.date}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {errors.date && touched.date && (
          <span className="field-error" role="alert">{errors.date}</span>
        )}
      </div>

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          id="expense-form-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
          id="expense-form-submit"
        >
          {isSubmitting
            ? (isEditMode ? 'Saving…' : 'Adding…')
            : (isEditMode ? '💾 Save Changes' : '➕ Add Expense')}
        </button>
      </div>
    </form>
  );
}
