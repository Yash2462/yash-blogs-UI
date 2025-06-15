import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia,
  TextField, MenuItem, Select, InputLabel, FormControl, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Alert, Paper
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import CloseIcon from '@mui/icons-material/Close';
import PostsGrid from '../components/PostsGrid';

// CommentsDialog component
export const CommentsDialog = ({ open, onClose, postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.get(`/api/comments/post/${postId}`)
      .then(res => {
        console.log('Fetched comments:', res.data);
        setComments(Array.isArray(res.data) ? res.data : res.data.comments || res.data.data || []);
      })
      .catch(() => setError('Failed to load comments.'))
      .finally(() => setLoading(false));
  }, [open, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/comments/user/${user.id}/post/${postId}/createComment`, { comment: newComment });
      // Refresh comments
      const res = await api.get(`/api/comments/post/${postId}`);
      console.log('Fetched comments:', res.data);
      setComments(Array.isArray(res.data) ? res.data : res.data.comments || res.data.data || []);
      setNewComment('');
    } catch {
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comments</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : comments.length === 0 ? (
          <Typography>No comments yet.</Typography>
        ) : (
          <List>
            {comments.map((comment, idx) => (
              <ListItem key={comment.id || idx} alignItems="flex-start">
                <ListItemText
                  primary={comment.comment || comment.text}
                  secondary={comment.user?.username ? `By ${comment.user.username}` : ''}
                />
              </ListItem>
            ))}
          </List>
        )}
        {user && (
          <Box mt={2}>
            <TextField
              label="Add a comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              disabled={submitting}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              disabled={submitting || !newComment.trim()}
              sx={{ mt: 1 }}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : 'Post Comment'}
            </Button>
          </Box>
        )}
        {!user && (
          <Typography color="text.secondary" mt={2}>Log in to add a comment.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/posts');
        const postsData = Array.isArray(res.data) 
          ? res.data 
          : res.data.posts || res.data.data || [];
        setPosts(postsData.slice(0, 3)); // Limit to 3 posts for dashboard
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary.main">
          Latest Posts
        </Typography>
      </Box>

      <Box 
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <PostsGrid posts={posts} />
      </Box>
    </Box>
  );
};

export default Dashboard; 