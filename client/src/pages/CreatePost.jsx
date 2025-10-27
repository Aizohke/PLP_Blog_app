
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { postService } from '../services/api';

const CreatePost = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      await postService.createPost(formData);
      alert('Post created successfully!');
      navigate('/');
    } catch (err) {
      alert('Error creating post: ' + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create New Post</h1>
      <PostForm onSubmit={handleSubmit} submitText="Create Post" />
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
};

export default CreatePost;