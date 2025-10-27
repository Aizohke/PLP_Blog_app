// client/src/hooks/useCategories.jsx
import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/api';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalize = (resp) => {
    // Accept many shapes: { data: [...] }, { categories: [...] }, { data: { categories: [...] } }
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.categories)) return resp.categories;
    if (resp.data && Array.isArray(resp.data.categories)) return resp.data.categories;
    // fallback: try to find first array value
    for (const k of Object.keys(resp)) {
      if (Array.isArray(resp[k])) return resp[k];
    }
    return [];
  };

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await categoryService.getAllCategories(); // should return response.data-like
      const normalized = normalize(resp || resp.data || {});
      setCategories(normalized);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories, loading, error, refetch: fetch };
};
