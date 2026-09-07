import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../hooks/useExpenses';
import { useBudgets } from '../hooks/useBudgets';
import { useBudgetAlerts } from '../hooks/useBudgetAlerts';
import { bannerNotice } from '../utils/budgetAlerts';
import { formatCurrency, formatDate } from '../utils/formatters';
import './Dashboard.css';


const CATEGORY_ICONS = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '⚡',
  Entertainment: '🎬', Health: '🏥', Education: '📚', Travel: '✈️', Other: '💼',
};

export default function Dashboard() {
  const { expenses, loading, error } = useExpenses();
  const { budgets, loading: budgetsLoading, error: budgetsError } = useBudgets();
  const { alerts, loading: alertsLoading } = useBudgetAlerts();

  const stats = useMemo(() => {
    if (!expenses.length) return null;

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const highest = expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
    const recent = [...expenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return { total, count: expenses.length, highest, recent };
  }, [expenses]);

  return (
    <main className="dashboard-page page-wrapper">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your expense summary at a glance</p>
        </div>
        <Link to="/expenses" className="btn-link" id="dashboard-view-all">
          View All Expenses →
        </Link>
      </header>

      {/* Budget alert banner */}
      {!alertsLoading && alerts.length > 0 && (
        <div className="budget-alert-banner" id="budget-alert-banner">
          <div className="budget-alert-banner-head">
            <span className="budget-alert-icon">🚨</span>
            <span className="budget-alert-title">
              Budget {alerts.some((a) => a.status === 'over') ? 'Alerts' : 'Watch'}
            </span>
            <Link to="/budgets" className="budget-alert-link" id="budget-alert-manage">
              Manage →
            </Link>
          </div>
          <ul className="budget-alert-list">
            {alerts.map((a) => {
              const { text, tone } = bannerNotice(a);
              return (
                <li key={a.budget_id} className={`budget-alert-item ${tone}`}>
                  <span className="budget-alert-dot" />
                  {text}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="dashboard-loading" id="dashboard-loading">
          <div className="spinner" />
          <p>Loading your expenses…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="dashboard-error" id="dashboard-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Stats */}
      {!loading && !error && (
        <>
          {stats ? (
            <>
              {/* Stat Cards */}
              <section className="stats-grid" aria-label="Expense statistics">
                <div className="stat-card" id="stat-total">
                  <div className="stat-icon">💸</div>
                  <div className="stat-value">{formatCurrency(stats.total)}</div>
                  <div className="stat-label">Total Spent</div>
                </div>

                <div className="stat-card" id="stat-count">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{stats.count}</div>
                  <div className="stat-label">Total Expenses</div>
                </div>

                <div className="stat-card" id="stat-highest">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{formatCurrency(stats.highest.amount)}</div>
                  <div className="stat-label">Highest Expense</div>
                  <div className="stat-sub">{stats.highest.title}</div>
                </div>

                <div className="stat-card" id="stat-average">
                  <div className="stat-icon">📊</div>
                  <div className="stat-value">
                    {formatCurrency(stats.total / stats.count)}
                  </div>
                  <div className="stat-label">Average Expense</div>
                </div>
              </section>

              {/* Recent Expenses */}
              <section className="recent-section">
                <div className="section-header">
                  <h2 className="section-title">🕐 Recent Expenses</h2>
                  <Link to="/expenses" className="section-link" id="dashboard-view-all-bottom">
                    View all →
                  </Link>
                </div>

                <div className="recent-list">
                  {stats.recent.map((expense) => (
                    <div key={expense.id} className="recent-item">
                      <div className="recent-item-left">
                        <span className="recent-icon">
                          {CATEGORY_ICONS[expense.category] || '💼'}
                        </span>
                        <div className="recent-info">
                          <span className="recent-title">{expense.title}</span>
                          <span className="recent-meta">
                            {expense.category} · {formatDate(expense.date)}
                          </span>
                        </div>
                      </div>
                      <span className="recent-amount">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Budget Summary */}
              {!budgetsLoading && !budgetsError && budgets.length > 0 && (
                <section className="budget-section">
                  <div className="section-header">
                    <h2 className="section-title">🎯 Budgets</h2>
                    <Link to="/budgets" className="section-link" id="dashboard-budgets-link">
                      Manage →
                    </Link>
                  </div>

                  <div className="budget-dash-list">
                    {budgets.map((budget) => {
                      const percent = budget.amount > 0
                        ? Math.min(100, ((budget.spent || 0) / budget.amount) * 100)
                        : 0;
                      const over = (budget.spent || 0) > budget.amount;
                      return (
                        <div key={budget.id} className="budget-dash-row">
                          <div className="budget-dash-head">
                            <span className="budget-dash-category">{budget.category}</span>
                            <span className={`budget-dash-amount ${over ? 'over' : ''}`}>
                              {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.amount)}
                            </span>
                          </div>
                          <div className="budget-dash-track">
                            <div
                              className={`budget-dash-fill ${over ? 'over' : ''}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="dashboard-empty" id="dashboard-empty">
              <div className="empty-icon">📭</div>
              <h2>No expenses yet</h2>
              <p>Start tracking by adding your first expense.</p>
              <Link to="/add-expense" className="btn-primary-link" id="dashboard-add-first">
                ➕ Add Your First Expense
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
