/**
 * hooks/useExpenses.js
 * Custom hook for fetching and managing expense list state.
 */

import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService';

export function useExpenses(filters = {}) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getAll(filters);
      setExpenses(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, loading, error, refetch: fetchExpenses };
}
