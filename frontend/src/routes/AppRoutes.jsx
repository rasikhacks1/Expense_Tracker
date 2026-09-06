/**
 * routes/AppRoutes.jsx
 * React Router route configuration.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import ExpensesPage from '../pages/ExpensesPage';
import CategoriesPage from '../pages/CategoriesPage';
import BudgetsPage from '../pages/BudgetsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/expenses" element={<ExpensesPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/budgets" element={<BudgetsPage />} />
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
