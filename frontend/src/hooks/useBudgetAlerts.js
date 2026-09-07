import { useEffect, useState, useCallback } from 'react';
import { getBudgetAlerts } from '../services/budgetService';

export function useBudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBudgetAlerts(true);
      setAlerts(data);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load budget alerts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { alerts, loading, error, refetch: load };
}
