
import { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import { postService } from '../services/api';

const Home = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const { posts, loading, error, pagination } = usePosts(page, 10, category);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const data = await postService.searchPosts(query);
      setSearchResults(data.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    setSearchResults(null);
  };

  const displayPosts = searchResults || posts;

  if (loading) return <div style={styles.loading}>Loading posts...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Latest Blog Posts</h1>
      
      <SearchBar onSearch={handleSearch} />
      <CategoryFilter
        selectedCategory={category}
        onCategoryChange={handleCategoryChange}
      />

      {searchResults && (
        <div style={styles.searchInfo}>
          <p>
            Found {searchResults.length} result(s)
            <button onClick={() => setSearchResults(null)} style={styles.clearButton}>
              Clear Search
            </button>
          </p>
        </div>
      )}

      <div style={styles.posts}>
        {displayPosts.length === 0 ? (
          <p style={styles.noPosts}>No posts found.</p>
        ) : (
          displayPosts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </div>

      {!searchResults && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    color: '#dc3545',
  },
  posts: {
    marginTop: '2rem',
  },
  noPosts: {
    textAlign: 'center',
    padding: '2rem',
    color: '#666',
  },
  searchInfo: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  clearButton: {
    marginLeft: '1rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Home;