/**
 * utils/formatters.js
 * Helper functions for currency, dates, and percentages.
 */

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Format a UTC date string or Date object to a human-readable date.
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a month string YYYY-MM to a readable format.
 * @param {string} month - "2026-09"
 * @returns {string}
 */
export function formatMonth(month) {
  if (!month) return '';
  const [year, mon] = month.split('-');
  const d = new Date(parseInt(year), parseInt(mon) - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Get current month in YYYY-MM format.
 * @returns {string}
 */
export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Clamp a percentage between 0 and 100 for display purposes.
 * @param {number} value
 * @returns {number}
 */
export function clampPercent(value) {
  return Math.min(100, Math.max(0, value));
}

/**
 * Get a color CSS variable name based on alert level.
 * @param {string} level - "safe" | "warning" | "danger"
 * @returns {string}
 */
export function alertLevelColor(level) {
  switch (level) {
    case 'danger': return 'var(--danger)';
    case 'warning': return 'var(--warning)';
    default: return 'var(--success)';
  }
}

/**
 * Truncate text to a max length.
 * @param {string} text
 * @param {number} max
 * @returns {string}
 */
export function truncate(text, max = 40) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}
