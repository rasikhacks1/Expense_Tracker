/**
 * context/AlertContext.jsx
 * Global context for budget alert state — consumed by Navbar and Dashboard.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/budgetService';
import { getCurrentMonth } from '../utils/formatters';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async (month) => {
    setLoading(true);
    try {
      const data = await budgetService.getAlerts(month || getCurrentMonth());
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const dangerCount = alerts.filter(a => a.level === 'danger').length;
  const warningCount = alerts.filter(a => a.level === 'warning').length;

  return (
    <AlertContext.Provider value={{ alerts, loading, fetchAlerts, dangerCount, warningCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertProvider');
  return ctx;
}
