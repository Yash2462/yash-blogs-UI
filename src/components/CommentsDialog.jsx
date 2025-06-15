import { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  IconButton,
  CircularProgress,
  Paper,
  Avatar,
  List,
  Button,
  TextField,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const CommentsDrawer = ({ open, onClose, comments = [], onAddComment, onDeleteComment, loading }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400, md: 420 },
          maxWidth: '100vw',
          boxShadow: 4,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Comments ({comments.length})
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : comments.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary', p: 3 }}>
            <Typography variant="body1" align="center">
              No comments yet. Be the first to comment!
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {comments.map((comment) => (
              <Paper
                key={comment.id}
                elevation={0}
                sx={{
                  mb: 2,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'grey.100',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 32,
                      height: 32,
                      fontSize: '0.875rem',
                    }}
                  >
                    {comment.user?.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {comment.user?.name || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                  <Tooltip title="Delete Comment">
                    <IconButton
                      size="small"
                      onClick={() => onDeleteComment(comment.id)}
                      sx={{
                        opacity: 0.6,
                        '&:hover': {
                          opacity: 1,
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </Box>
      <Divider />
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              '&:hover': {
                '& > fieldset': {
                  borderColor: 'primary.main',
                },
              },
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!newComment.trim() || loading}
            sx={{
              minWidth: '100px',
              borderRadius: '20px',
            }}
          >
            Post
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CommentsDrawer; 