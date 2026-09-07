import { useState, useEffect, useCallback } from 'react';
import { getBudgets } from '../services/budgetService';

export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to load budgets. Please check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
  };
}