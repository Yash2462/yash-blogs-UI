import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Alert,
  Stack,
  GlobalStyles,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';

const Posts = () => {
  const { user, loadingUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch initial categories and posts
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const catRes = await api.get('/api/category');
        const categoriesData =
          catRes.data.categories || catRes.data.data || catRes.data || [];

        setCategories([{ id: 'All', name: 'All' }, ...categoriesData]);

        const postRes = await api.get('/api/posts');
        const postsData =
          postRes.data.posts || postRes.data.data || postRes.data || [];
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load the page. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch posts when category changes
  useEffect(() => {
    const fetchPostsByCategory = async () => {
      if (selectedCategory === 'All') {
        setLoading(true);
        try {
          const res = await api.get('/api/posts');
          const postsData = res.data.posts || res.data.data || res.data || [];
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching all posts:', error);
          setAlert({
            type: 'error',
            message: 'Failed to fetch posts. Please try again later.',
          });
          setPosts([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      // Specific category
      const selected = categories.find((c) => c.name === selectedCategory);
      if (!selected || selected.id === 'All') return;

      setLoading(true);
      try {
        const res = await api.get(`/api/posts/category/${selected.id}/posts`);
        const postsData = res.data.posts || res.data.data || res.data || [];
        setPosts(postsData);
      } catch (error) {
        console.error(`Error fetching posts for category ${selectedCategory}:`, error);
        setAlert({
          type: 'error',
          message: `Failed to fetch posts for ${selectedCategory}.`,
        });
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loading) fetchPostsByCategory();
  }, [selectedCategory]);

  const handleCategoryClick = (categoryName) => {
    if (categoryName !== selectedCategory) {
      setSelectedCategory(categoryName);
    }
  };

  return (
    <>
      {/* Global custom scroll styles */}
      <GlobalStyles
        styles={{
          '*::-webkit-scrollbar': {
            width: '4px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      />

      {/* Scrollable page content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 2,
          height: 'calc(100vh - 96px)',
          overflowY: 'auto',
          pr: 1,
          pb: 5,
        }}
      >
        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 2 }}
          >
            {alert.message}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', my: 2 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to BlogSpace
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '700px', mx: 'auto' }}
          >
            Discover amazing stories, share your thoughts, and connect with a
            community of passionate writers and readers.
          </Typography>
        </Box>

        {/* Category filters */}
        <Stack
          direction="row"
          justifyContent="center"
          spacing={2}
          sx={{ mb: 6, flexWrap: 'wrap' }}
        >
          {categories.map((category) => (
            <Button
              key={category.id || category.name}
              variant={
                selectedCategory === category.name ? 'contained' : 'outlined'
              }
              onClick={() => handleCategoryClick(category.name)}
              sx={{
                borderRadius: 20,
                textTransform: 'none',
                fontWeight: 'medium',
                my: 0.5,
              }}
            >
              {category.name}
            </Button>
          ))}
        </Stack>

        {/* Post list or loader */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <PostsGrid posts={posts} />
        )}
      </Container>
    </>
  );
};

export default Posts;
