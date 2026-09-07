import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Expenses from '../pages/Expenses';
import AddExpense from '../pages/AddExpense';
import Categories from '../pages/Categories';
import Budgets from '../pages/Budgets';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/add-expense" element={<AddExpense />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/budgets" element={<Budgets />} />
      {/* Redirect any unknown route back to the Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}