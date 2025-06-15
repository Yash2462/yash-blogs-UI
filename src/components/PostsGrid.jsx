import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton, 
  Box,
  Grid,
  Container,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  Comment as CommentIcon,
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isValid } from 'date-fns';

const PostsGrid = ({ posts, onLike, onCommentClick }) => {
  const navigate = useNavigate();

  const handlePostClick = (post) => {
    if (!post) return;
    
    // Get the post ID from any of the possible fields
    const postId = post._id || post.id || post.postId;
    if (!postId) {
      console.error('Post has no ID:', post);
      return;
    }

    console.log('Navigating to post:', postId); // Debug log
    navigate(`/posts/${postId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) {
        return 'Invalid date';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No posts available
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        width: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbarWidth': 'none',
      }}>
        <Grid container spacing={2} sx={{ p: 1 }}>
          {posts.map((post) => {
            const postId = post._id || post.id || post.postId;
            if (!postId) {
              console.warn('Post missing ID:', post);
              return null;
            }

            return (
              <Grid key={postId} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    maxWidth: 320,
                    mx: 'auto',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                    },
                  }}
                >
                  <Box 
                    onClick={() => handlePostClick(post)}
                    sx={{ 
                      cursor: 'pointer',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {(post.postImage || post.imageUrl) && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={post.postImage || post.imageUrl}
                        alt={post.title || 'Post image'}
                        sx={{
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="h2" 
                        noWrap
                        sx={{ 
                          fontSize: '1rem',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        {post.title || 'Untitled Post'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          mb: 1.5,
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {post.data || post.content || 'No content available'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {post.category && (
                          <Chip
                            label={post.category.name || 'Uncategorized'}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                        {post.user && (
                          <Chip
                            label={`By ${post.user.username || 'Anonymous'}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatDate(post.createdAt || post.created_at)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Box>
                  <Box sx={{ 
                    p: 1, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLike(postId);
                        }}
                        color={post.isLiked ? "primary" : "default"}
                      >
                        {post.isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary">
                        {post.likes || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="View Comments">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onCommentClick(postId);
                          }}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <CommentIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        {post.comments?.length || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};

export default PostsGrid; 