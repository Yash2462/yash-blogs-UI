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
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import Dashboard from './Dashboard';
import { CommentsDialog } from './Dashboard';
import PostsGrid from '../components/PostsGrid';
import CloseIcon from '@mui/icons-material/Close';

const PostForm = ({ open, onClose, onSubmit, post, categories, loading }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [data, setData] = useState(post?.data || '');
  const [categoryId, setCategoryId] = useState(post?.category?.id || '');
  const [postImage, setPostImage] = useState(post?.postImage || '');

  useEffect(() => {
    setTitle(post?.title || '');
    setData(post?.data || '');
    setCategoryId(post?.category?.id || '');
    setPostImage(post?.postImage || '');
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, data, categoryId, postImage });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{post ? 'Edit Post' : 'Create Post'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Content"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="normal"
            value={postImage}
            onChange={(e) => setPostImage(e.target.value)}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.length === 0 ? (
                <MenuItem value="" disabled>
                  No categories available
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : post ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Posts = () => {
  const { user, loadingUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [fetching, setFetching] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch posts from API
  const fetchPosts = async () => {
    setFetching(true);
    try {
      const res = await api.get('/api/posts');
      let postsArray = [];
      if (Array.isArray(res.data)) {
        postsArray = res.data;
      } else if (res.data && Array.isArray(res.data.posts)) {
        postsArray = res.data.posts;
      } else if (res.data && Array.isArray(res.data.data)) {
        postsArray = res.data.data;
      }
      setPosts(postsArray);
    } catch {
      setAlert({ type: 'error', message: 'Failed to fetch posts.' });
      setPosts([]);
    } finally {
      setFetching(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/category');
      let categoriesArray = [];
      if (Array.isArray(res.data)) {
        categoriesArray = res.data;
      } else if (res.data && Array.isArray(res.data.categories)) {
        categoriesArray = res.data.categories;
      } else if (res.data && Array.isArray(res.data.data)) {
        categoriesArray = res.data.data;
      }
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setAlert({ type: 'error', message: 'Failed to fetch categories.' });
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Create new post
  const handleCreate = async (data) => {
    if (!user || !user.id) {
      setAlert({ type: 'error', message: 'User not loaded. Please log in again.' });
      return;
    }
    setLoading(true);
    setAlert({});
    try {
      await api.post(
        `/api/posts/user/${user.id}/category/${data.categoryId}`,
        {
          title: data.title,
          data: data.data,
          postImage: data.postImage,
        }
      );
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Post created successfully!' });
      fetchPosts();
    } catch {
      setAlert({ type: 'error', message: 'Failed to create post.' });
    } finally {
      setLoading(false);
    }
  };

  // Edit existing post
  const handleEdit = async (data) => {
    if (!editingPost || !editingPost.postId) {
      setAlert({ type: 'error', message: 'No post selected for editing.' });
      return;
    }
    setLoading(true);
    setAlert({});
    try {
      await api.put(`/api/posts/${editingPost.postId}`, { ...editingPost, ...data });
      setEditingPost(null);
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Post updated successfully!' });
      fetchPosts();
    } catch {
      setAlert({ type: 'error', message: 'Failed to update post.' });
    } finally {
      setLoading(false);
    }
  };

  // Delete post by ID
  const handleDelete = async (postId) => {
    setLoading(true);
    setAlert({});
    try {
      await api.delete(`/api/posts/${postId}`);
      setAlert({ type: 'success', message: 'Post deleted successfully!' });
      fetchPosts();
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete post.' });
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
    <Box 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box 
        sx={{
          p: 3,
          pb: 3,
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          gap: 2,
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="primary.main"
          sx={{
            order: { xs: 1, md: 1 },
            flexBasis: { xs: '100%', md: 'auto' },
            mb: { xs: 2, md: 0 },
          }}
        >
          All Posts
        </Typography>

        <Box 
          sx={{ 
            display: 'flex',
            gap: 2,
            order: { xs: 2, md: 2 },
            width: { xs: '100%', md: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <TextField
            label="Search by Title"
            value={searchTitle}
            onChange={e => setSearchTitle(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ 
              width: { xs: '100%', sm: 200 },
              minWidth: { sm: 200 },
              bgcolor: 'background.paper',
            }}
          />
          <FormControl 
            variant="outlined" 
            size="small" 
            sx={{ 
              width: { xs: '100%', sm: 180 },
              minWidth: { sm: 180 },
              bgcolor: 'background.paper',
            }}
          >
            <InputLabel>Category</InputLabel>
            <Select
              value={searchCategory}
              onChange={e => setSearchCategory(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box 
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PostsGrid 
          posts={filteredPosts}
          onPostClick={post => { setSelectedPost(post); setPostDialogOpen(true); }} 
        />
      </Box>

      {/* Post Dialog */}
      <Dialog open={postDialogOpen} onClose={() => setPostDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedPost?.title}
          <CloseIcon onClick={() => setPostDialogOpen(false)} style={{ position: 'absolute', right: 8, top: 8, cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent dividers>
          {selectedPost?.postImage && (
            <Box mb={2}>
              <img src={selectedPost.postImage} alt={selectedPost.title} style={{ width: '100%', borderRadius: 8 }} />
            </Box>
          )}
          <Typography variant="body1" mb={2}>{selectedPost?.data}</Typography>
          <Typography variant="caption" color="text.secondary">
            By {selectedPost?.user?.username || 'Unknown'} in {selectedPost?.category?.name || 'Uncategorized'}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Posts;
