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
  CardActions,
  IconButton,
  Chip,
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
import { ThumbUp as ThumbUpIcon, Comment as CommentIcon } from '@mui/icons-material';
import ArticleIcon from '@mui/icons-material/Article';

const Posts = () => {
  const { user, loadingUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [alert, setAlert] = useState(null);
  const [postStats, setPostStats] = useState({});
  const [fetching, setFetching] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [totalStats, setTotalStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0
  });

  useEffect(() => {
    fetchAllPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setLikedPosts(new Set());
    }
  }, [user]);

  const fetchAllPosts = async () => {
    setFetching(true);
    try {
      const response = await api.get('/api/posts');
      let postsData = [];
      
      // Handle different response structures
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          postsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          postsData = response.data;
        } else if (response.data.posts && Array.isArray(response.data.posts)) {
          postsData = response.data.posts;
        }
      }

      // Validate and normalize posts data
      const validPosts = postsData
        .filter(post => post && (post.id || post.postId || post._id))
        .map(post => ({
          ...post,
          id: post.id || post.postId || post._id,
          title: post.title || 'Untitled Post',
          data: post.data || post.content || '',
          postImage: post.postImage || post.imageUrl || null,
          category: post.category || { name: 'Uncategorized' },
          user: post.user || { username: 'Anonymous' }
        }));
      
      setPosts(validPosts);
      
      // Fetch stats for all posts
      const statsPromises = validPosts.map(post => fetchPostStats(post.id));
      await Promise.all(statsPromises);

      // Update liked posts if user is logged in
      if (user?.id) {
        const newLikedPosts = new Set();
        validPosts.forEach(post => {
          if (post.likedBy && Array.isArray(post.likedBy)) {
            const hasLiked = post.likedBy.some(like => like.id === user.id);
            if (hasLiked) {
              newLikedPosts.add(post.id);
            }
          }
        });
        setLikedPosts(newLikedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to fetch posts. Please try again later.' 
      });
      setPosts([]); // Set empty array on error to prevent undefined state
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await api.get('/api/category');
      console.log('Categories response:', response.data); // Debug log
      
      let categoriesData = [];
      
      // Handle different response structures
      if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data.categories && Array.isArray(response.data.categories)) {
          categoriesData = response.data.categories;
        }
      }

      // Validate and normalize categories data
      const validCategories = categoriesData
        .filter(category => category && (category.id || category._id))
        .map(category => ({
          id: category.id || category._id,
          name: category.name || 'Uncategorized',
          description: category.description || ''
        }));

      console.log('Processed categories:', validCategories); // Debug log
      setCategories(validCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to fetch categories. Please try again later.' 
      });
      setCategories([]); // Set empty array on error
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Add retry mechanism for categories
  const retryFetchCategories = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        await fetchCategories();
        return; // Success, exit the retry loop
      } catch (error) {
        if (i === retries - 1) throw error; // Last retry failed
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const fetchPostStats = async (postId) => {
    if (!postId) return;
    try {
      const response = await api.get(`/api/posts/${postId}/stats`);
      setPostStats(prev => ({
        ...prev,
        [postId]: response.data.data || { likes: 0, comments: 0 }
      }));
    } catch (error) {
      console.error('Error fetching post stats:', error);
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
      await fetchAllPosts();
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
    if (!user?.id) {
      setAlert({ type: 'error', message: 'Please login to like posts' });
      return;
    }

    try {
      const response = await api.post(`/api/posts/${postId}/like/user/${user.id}`);
      const isLiked = response.data.data === 1;
      
      // Update liked posts state
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });

      // Update the post's likedBy array in the posts state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const likedBy = post.likedBy || [];
          return {
            ...post,
            likedBy: isLiked 
              ? [...likedBy, { id: user.id, email: user.email, username: user.username }]
              : likedBy.filter(like => like.id !== user.id)
          };
        }
        return post;
      }));

      // Fetch updated stats
      await fetchPostStats(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      setAlert({ type: 'error', message: 'Failed to like post' });
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
          {alert && (
            <Alert 
              severity={alert.type} 
              onClose={() => setAlert(null)}
              sx={{ mb: 2 }}
            >
              {alert.message}
            </Alert>
          )}

          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PostsGrid 
              posts={filteredPosts} 
              onLike={handleLike}
              onCommentClick={handleOpenComments}
              postStats={postStats}
              likedPosts={likedPosts}
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
        loading={loading}
      />

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={selectedPostId}
        onCommentAdded={() => {
          if (selectedPostId) {
            fetchPostStats(selectedPostId);
          }
        }}
      />
    </Box>
  );
};

export default Posts;
