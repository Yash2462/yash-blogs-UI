import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

const CommentsDrawer = ({ open, onClose, postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && postId) {
      fetchComments();
    }
  }, [open, postId]);

  const fetchComments = async () => {
    if (!postId) {
      setError('No post ID provided');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/comments/post/${postId}`);
      const commentsData = res.data?.data || [];
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user?.id || !postId) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/comments/user/${user.id}/post/${postId}/createComment`, {
        comment: newComment
      });
      setNewComment('');
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!commentId) return;
    
    try {
      await api.delete(`/api/comments/${commentId}`);
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          bgcolor: 'background.paper',
        },
      }}
    >
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}>
          <Typography variant="h6">Comments</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Comments List */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          p: 2,
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
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            <List>
              {comments.map((comment) => (
                <React.Fragment key={comment.commentId}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      px: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{comment.user?.username?.[0]?.toUpperCase() || 'U'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {comment.user?.username || 'Unknown'}
                          </Typography>
                          {user?.id === comment.user?.id && (
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(comment.commentId)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {comment.comment}
                          </Typography>
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDistanceToNow(new Date(comment.commentedAt), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Comment Input */}
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'background.paper',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!newComment.trim() || submitting}
                sx={{
                  minWidth: '40px',
                  px: 2,
                }}
              >
                <SendIcon />
              </Button>
            </Box>
          </form>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CommentsDrawer; 