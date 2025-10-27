import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  return (
    <div style={styles.card}>
      {post.featuredImage && (
        <img
          src={`http://localhost:5000/uploads/${post.featuredImage}`}
          alt={post.title}
          style={styles.image}
        />
      )}
      <div style={styles.content}>
        <h2 style={styles.title}>{post.title}</h2>
        <p style={styles.excerpt}>
          {post.excerpt || post.content.substring(0, 150) + '...'}
        </p>
        <div style={styles.meta}>
          <span style={styles.author}>By {post.author?.name}</span>
          <span style={styles.category}>{post.category?.name}</span>
          <span style={styles.views}>{post.viewCount} views</span>
        </div>
        <Link to={`/posts/${post._id}`} style={styles.readMore}>
          Read More →
        </Link>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '2rem',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  content: {
    padding: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#333',
  },
  excerpt: {
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '1rem',
  },
  author: {},
  category: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
  },
  views: {},
  readMore: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default PostCard;