import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/api';

export const usePosts = (page = 1, limit = 10, category = null) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(
    async (p = page, l = limit, c = category) => {
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getAllPosts(p, l, c);
        setPosts(Array.isArray(data.data) ? data.data : []);
        setPagination({
          page: data.page ?? p,
          pages: data.pages ?? 1,
          total: data.total ?? (Array.isArray(data.data) ? data.data.length : 0),
        });
      } catch (err) {
        setError(err?.response?.data?.error || err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    },
    [page, limit, category]
  );

  useEffect(() => {
    fetchPosts(page, limit, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, category]);

  return { posts, loading, error, pagination, refetch: fetchPosts };
};
