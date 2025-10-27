import { useCategories } from '../hooks/useCategories';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const { categories, loading } = useCategories();

  if (loading) return <p>Loading categories...</p>;

  return (
    <div style={styles.container}>
      <label style={styles.label}>Filter by Category:</label>
      <select
        value={selectedCategory || ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        style={styles.select}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '2rem',
  },
  label: {
    marginRight: '1rem',
    fontWeight: 'bold',
  },
  select: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
};

export default CategoryFilter;