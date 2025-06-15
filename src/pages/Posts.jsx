import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
  CircularProgress,
  Container,
  Paper,
  InputAdornment,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Dashboard from './Dashboard';
import { CommentsDialog } from './Dashboard';
import PostsGrid from '../components/PostsGrid';
import CloseIcon from '@mui/icons-material/Close';
import PostForm from '../components/PostForm';
import CommentsDrawer from '../components/CommentsDrawer';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';

const Posts = () => {
  const { user, loadingUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [fetching, setFetching] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    setFetching(true);
    try {
      const res = await api.get('/api/posts');
      const postsData = Array.isArray(res.data) 
        ? res.data 
        : res.data.posts || res.data.data || [];
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setAlert({ type: 'error', message: 'Failed to fetch posts' });
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/api/category');
      const categoriesData = Array.isArray(res.data) 
        ? res.data 
        : res.data.categories || res.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAlert({ type: 'error', message: 'Failed to fetch categories' });
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleCreate = async (data) => {
    if (!user?.id) {
      setAlert({ type: 'error', message: 'User not logged in' });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/posts/user/${user.id}/category/${data.categoryId}`, {
        title: data.title,
        data: data.data,
        postImage: data.postImage
      });
      setCreateDialogOpen(false);
      setAlert({ type: 'success', message: 'Post created successfully!' });
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      setAlert({ type: 'error', message: 'Failed to create post' });
    } finally {
      setLoading(false);
    }
  };

  // Filter posts by title and category
  const filteredPosts = posts.filter(post => {
    const matchesTitle = post.title?.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesCategory = searchCategory ? String(post.category?.id) === String(searchCategory) : true;
    return matchesTitle && matchesCategory;
  });

  const handleLike = async (postId) => {
    if (!user || !user.id) return;
    try {
      await api.post(`/api/posts/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleOpenComments = (postId) => {
    setSelectedPostId(postId);
    setCommentsOpen(true);
  };

  // Show loader while user info is loading
  if (loadingUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  // Show message if user is not logged in
  if (!user || !user.id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <Typography variant="h6" color="text.secondary">
          Please log in to view and create posts.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: 'calc(100vh - 64px)',
      bgcolor: 'background.default',
    }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
          }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Posts
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCreateDialogOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              Create Post
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search posts..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-filter-label">Category</InputLabel>
                <Select
                  labelId="category-filter-label"
                  value={searchCategory}
                  label="Category"
                  onChange={(e) => setSearchCategory(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  }
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: '8px',
                    '&:hover': {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categoriesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading categories...
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.3)',
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
      }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {alert.message && (
            <Alert 
              severity={alert.type} 
              sx={{ mb: 2 }}
              onClose={() => setAlert({ type: '', message: '' })}
            >
              {alert.message}
            </Alert>
          )}
          
          {fetching ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : (
            <PostsGrid 
              posts={filteredPosts} 
              onLike={handleLike}
              onCommentClick={handleOpenComments}
            />
          )}
        </Container>
      </Box>

      <PostForm
        open={createDialogOpen}
        onClose={() => {
          setCreateDialogOpen(false);
          setLoading(false);
        }}
        onSubmit={handleCreate}
        categories={categories}
        loading={loading}
      />

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={selectedPostId}
        onCommentAdded={() => fetchPosts()}
      />
    </Box>
  );
};

export default Posts;
