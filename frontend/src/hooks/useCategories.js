import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../services/categoryService';


export function useCategories(type) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories(type);
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(
        err?.response?.data?.detail ||
          'Failed to load categories. Please check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}