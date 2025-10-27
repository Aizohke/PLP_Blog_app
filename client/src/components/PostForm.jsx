import { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';

const PostForm = ({ initialData, onSubmit, submitText = 'Submit' }) => {
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    isPublished: false,
    ...initialData,
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'tags') {
        data.append(key, formData[key].split(',').map((tag) => tag.trim()));
      } else {
        data.append(key, formData[key]);
      }
    });

    if (image) {
      data.append('featuredImage', image);
    }

    onSubmit(data);
  };

  // ✅ Custom predefined categories (fallback)
  const predefinedCategories = [
    { _id: 'Technology', name: 'Technology' },
    { _id: 'engineering', name: 'Engineering' },
    { _id: 'news', name: 'news' },
    { _id: 'innovation', name: 'Innovation' },
    { _id: 'education', name: 'Education' },
    { _id: 'lifestyle', name: 'Lifestyle' },
  ];

  const categoryList = categories?.length ? categories : predefinedCategories;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Content *</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="10"
          style={styles.textarea}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Excerpt</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          rows="3"
          style={styles.textarea}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          style={styles.select}
        >
          <option value="">Select a category</option>
          {categoryList.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="react, nodejs, mongodb"
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Featured Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="isPublished"
            checked={formData.isPublished}
            onChange={handleChange}
            style={styles.checkbox}
          />
          Publish immediately
        </label>
      </div>

      <button type="submit" style={styles.button}>
        {submitText}
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.75rem 2rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default PostForm;
