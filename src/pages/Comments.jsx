import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';
import api from '../api/axios';

const CommentForm = ({ open, onClose, onSubmit, comment, loading }) => {
  const [text, setText] = useState(comment?.comment || '');

  useEffect(() => {
    setText(comment?.comment || '');
  }, [comment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ comment: text });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{comment ? 'Edit Comment' : 'Add Comment'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField label="Comment" fullWidth margin="normal" value={text} onChange={e => setText(e.target.value)} required />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : (comment ? 'Update' : 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Comments = ({ postId = 1 }) => {
  const [comments, setComments] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [fetching, setFetching] = useState(true);

  const fetchComments = async () => {
    setFetching(true);
    try {
      const res = await api.get(`/api/comments/post/${postId}`);
      setComments(res.data);
    } catch {
      setAlert({ type: 'error', message: 'Failed to fetch comments.' });
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreate = async (data) => {
    setLoading(true);
    setAlert({});
    try {
      await api.post(`/api/comments/user/1/post/${postId}/createComment`, data);
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Comment added successfully!' });
      fetchComments();
    } catch {
      setAlert({ type: 'error', message: 'Failed to add comment.' });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (data) => {
    setLoading(true);
    setAlert({});
    try {
      await api.put(`/api/comments/${editingComment.commentId}`, data);
      setEditingComment(null);
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Comment updated successfully!' });
      fetchComments();
    } catch {
      setAlert({ type: 'error', message: 'Failed to update comment.' });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (commentId) => {
    setLoading(true);
    setAlert({});
    try {
      await api.delete(`/api/comments/${commentId}`);
      setAlert({ type: 'success', message: 'Comment deleted successfully!' });
      fetchComments();
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete comment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} bgcolor="background.default">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="bold" color="primary.main">Comments</Typography>
        <Button variant="contained" color="primary" onClick={() => { setEditingComment(null); setOpenForm(true); }}>Add Comment</Button>
      </Box>
      {alert.message && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
      {fetching ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>
      ) : comments.length === 0 ? (
        <Box textAlign="center" color="text.secondary" mt={8}>
          <Box fontSize={64} mb={2}>💬</Box>
          <Typography variant="h6">No comments yet.</Typography>
          <Typography variant="body2">Be the first to add a comment!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {comments.map(comment => (
            <Grid item xs={12} md={6} lg={4} key={comment.commentId}>
              <Card>
                <CardContent>
                  <Typography variant="body1">{comment.comment}</Typography>
                  <Typography variant="caption" color="text.secondary">By {comment.user?.username || 'Unknown'}</Typography>
                  <Box mt={2} display="flex" gap={1}>
                    <Button size="small" variant="outlined" onClick={() => { setEditingComment(comment); setOpenForm(true); }}>Edit</Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(comment.commentId)}>Delete</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <CommentForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingComment(null); }}
        onSubmit={editingComment ? handleEdit : handleCreate}
        comment={editingComment}
        loading={loading}
      />
    </Box>
  );
};

export default Comments; 