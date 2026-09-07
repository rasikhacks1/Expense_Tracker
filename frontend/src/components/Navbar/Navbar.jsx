import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-brand">
        <span className="navbar-logo">💰</span>
        <span className="navbar-title">Expense Tracker</span>
      </div>

      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            id="nav-dashboard"
          >
            📊 Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            id="nav-expenses"
          >
            📋 Expenses
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/add-expense"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            id="nav-add-expense"
          >
            ➕ Add Expense
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/categories"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            id="nav-categories"
          >
            🏷️ Categories
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/budgets"
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            id="nav-budgets"
          >
            🎯 Budgets
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
