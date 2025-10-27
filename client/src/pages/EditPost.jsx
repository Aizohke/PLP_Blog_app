
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { postService } from '../services/api';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postService.getPost(id);
        setPost(data.data);
      } catch (err) {
        alert('Error loading post: ' + err.message);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    try {
      await postService.updatePost(id, formData);
      alert('Post updated successfully!');
      navigate(`/posts/${id}`);
    } catch (err) {
      alert('Error updating post: ' + err.message);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!post) return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Edit Post</h1>
      <PostForm
        initialData={{
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          category: post.category._id,
          tags: post.tags.join(', '),
          isPublished: post.isPublished,
        }}
        onSubmit={handleSubmit}
        submitText="Update Post"
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    fontSize: '1.2rem',
  },
};

export default EditPost;