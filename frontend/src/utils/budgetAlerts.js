import toast from 'react-hot-toast';
import { formatCurrency } from './formatters';


export const WARNING_THRESHOLD_PERCENT = 80;


export function alertSummary(a) {
  const pct = Number(a.percent ?? 0).toFixed(1);
  return `${a.category} is at ${pct}% of its ${formatCurrency(a.limit)} limit (spent ${formatCurrency(a.spent ?? 0)})`;
}


export function toastBudgetCheck(result) {
  if (!result || result.status === 'ok') return;
  if (result.status === 'over') {
    toast.error(`⚠️ Over budget: ${result.message}. ${alertSummary(result)}`);
  } else {
    toast(`${result.message}. ${alertSummary(result)}`, {
      icon: '⚠️',
      duration: 5000,
    });
  }
}


export function bannerNotice(a) {
  const over = a.status === 'over';
  const text = over
    ? `${a.category} is over its ${formatCurrency(a.limit)} budget — spent ${formatCurrency(a.spent)} (${Number(a.percent ?? 0).toFixed(1)}%)`
    : `${a.category} is at ${Number(a.percent ?? 0).toFixed(1)}% of its ${formatCurrency(a.limit)} budget — spent ${formatCurrency(a.spent)}`;
  return { text, tone: over ? 'over' : 'warning' };
}
