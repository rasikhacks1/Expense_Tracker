export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export function validateField(name, value) {
  switch (name) {
    case 'title':
      if (!value || !String(value).trim()) return 'Title is required.';
      if (String(value).trim().length > 100) return 'Title must be 100 characters or fewer.';
      return '';

    case 'amount':
      if (value === '' || value === null || value === undefined) return 'Amount is required.';
      if (isNaN(Number(value))) return 'Amount must be a number.';
      if (Number(value) <= 0) return 'Amount must be greater than 0.';
      return '';

    case 'category':
      if (!value) return 'Category is required.';
      if (String(value).trim().length > 50) return 'Category must be 50 characters or fewer.';
      return '';

    case 'date':
      if (!value) return 'Date is required.';
      if (isNaN(Date.parse(value))) return 'Date must be a valid date.';
      return '';

    default:
      return '';
  }
}


export function validateExpenseForm(formData) {
  const requiredFields = ['title', 'amount', 'category', 'date'];
  const errors = {};

  for (const field of requiredFields) {
    const error = validateField(field, formData[field]);
    if (error) errors[field] = error;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
