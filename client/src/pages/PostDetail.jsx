
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import CommentSection from '../components/CommentSection';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await postService.getPost(id);
        setPost(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post._id);
        navigate('/');
      } catch (err) {
        alert('Error deleting post: ' + err.message);
      }
    }
  };

  const handleAddComment = async (content) => {
    try {
      const data = await postService.addComment(post._id, { content });
      setPost(data.data);
    } catch (err) {
      alert('Error adding comment: ' + err.message);
    }
  };

  if (loading) return <div style={styles.loading}>Loading post...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!post) return <div style={styles.error}>Post not found</div>;

  const isAuthor = user && post.author._id === user.id;

  return (
    <div style={styles.container}>
      <article style={styles.article}>
        {post.featuredImage && (
          <img
            src={`http://localhost:5000/uploads/${post.featuredImage}`}
            alt={post.title}
            style={styles.image}
          />
        )}

        <h1 style={styles.title}>{post.title}</h1>

        <div style={styles.meta}>
          <span>By {post.author.name}</span>
          <span>{post.category.name}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <span>{post.viewCount} views</span>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={styles.tags}>
            {post.tags.map((tag, index) => (
              <span key={index} style={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div style={styles.content}>
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {isAuthor && (
          <div style={styles.actions}>
            <Link to={`/posts/edit/${post._id}`} style={styles.editButton}>
              Edit Post
            </Link>
            <button onClick={handleDelete} style={styles.deleteButton}>
              Delete Post
            </button>
          </div>
        )}
      </article>

      <CommentSection
        comments={post.comments}
        onAddComment={handleAddComment}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  article: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  image: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    color: '#333',
  },
  meta: {
    display: 'flex',
    gap: '1.5rem',
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  tags: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e9ecef',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#495057',
  },
  content: {
    lineHeight: '1.8',
    fontSize: '1.1rem',
    color: '#333',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #ddd',
  },
  editButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
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
};

export default PostDetail;