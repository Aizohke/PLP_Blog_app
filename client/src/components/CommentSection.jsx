
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const CommentSection = ({ comments = [], onAddComment }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onAddComment(content);
      setContent('');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Comments ({comments.length})</h3>

      {user && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            rows="3"
            style={styles.textarea}
          />
          <button type="submit" style={styles.button}>
            Post Comment
          </button>
        </form>
      )}

      {!user && (
        <p style={styles.loginPrompt}>Please log in to comment</p>
      )}

      <div style={styles.comments}>
        {comments.map((comment, index) => (
          <div key={index} style={styles.comment}>
            <div style={styles.commentHeader}>
              <strong>{comment.user?.name || 'Anonymous'}</strong>
              <span style={styles.commentDate}>
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p style={styles.commentContent}>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '3rem',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#333',
  },
  form: {
    marginBottom: '2rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginBottom: '0.5rem',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loginPrompt: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: '2rem',
  },
  comments: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  comment: {
    backgroundColor: '#f8f9fa',
    padding: '1rem',
    borderRadius: '4px',
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  commentDate: {
    color: '#888',
    fontSize: '0.85rem',
  },
  commentContent: {
    color: '#333',
    lineHeight: '1.6',
  },
};

export default CommentSection;