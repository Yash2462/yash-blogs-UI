import React, { useEffect, useState } from 'react';
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
  Tooltip,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isValid } from 'date-fns';
import PropTypes from 'prop-types';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const PostsGrid = ({ posts = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    const initialLikedPosts = new Set();
    if (user && posts.length > 0) {
      posts.forEach((post) => {
        const postId = post._id || post.id || post.postId;
        if (post.likedBy?.some((like) => like.id === user.id)) {
          initialLikedPosts.add(postId);
        }
      });
      setLikedPosts(initialLikedPosts);
    }

    const fetchAllStats = async () => {
      if (posts.length === 0) return;
      const newStats = {};
      for (const post of posts) {
        const postId = post._id || post.id || post.postId;
        if (postId && !postStats[postId]) {
          try {
            const response = await api.get(`/api/posts/${postId}/stats`);
            newStats[postId] = response.data.data || { likes: 0, comments: 0 };
          } catch (error) {
            console.error(`Failed to fetch stats for post ${postId}`, error);
            newStats[postId] = { likes: 0, comments: 0 };
          }
        }
      }
      if (Object.keys(newStats).length > 0) {
        setPostStats((prev) => ({ ...prev, ...newStats }));
      }
    };

    fetchAllStats();
  }, [posts, user]);

  const handleLikeClick = async (e, postId) => {
    e.stopPropagation();
    if (!user) return;

    const wasLiked = likedPosts.has(postId);
    const originalStats = { ...postStats };
    const originalLikedPosts = new Set(likedPosts);

    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    setPostStats((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        likes: (prev[postId]?.likes || 0) + (wasLiked ? -1 : 1),
      },
    }));

    try {
      await api.post(`/api/posts/${postId}/like/user/${user.id}`);
    } catch (error) {
      console.error('Failed to update like status', error);
      setPostStats(originalStats);
      setLikedPosts(originalLikedPosts);
    }
  };

  const handlePostClick = (post) => {
    const postId = post._id || post.id || post.postId;
    if (postId) {
      navigate(`/posts/${postId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || !isValid(new Date(dateString))) return 'No date';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        <Grid container spacing={4} sx={{ p: 2 }}>
          {posts.map((post) => {
            const postId = post._id || post.id || post.postId;
            if (!postId) return null;
            const isLiked = likedPosts.has(postId);
            const stats = postStats[postId] || { likes: 0, comments: 0 };

            return (
              <Grid item key={postId} xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    maxWidth: 320,
                    mx: 'auto',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    onClick={() => handlePostClick(post)}
                    sx={{
                      cursor: 'pointer',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {(post.postImage || post.imageUrl) && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.postImage || post.imageUrl}
                        alt={post.title || 'Post image'}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip
                          label={post.category?.name || 'Uncategorized'}
                          size="small"
                          color="primary"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(post.createdAt || post.updatedAt)}
                        </Typography>
                      </Box>
                      <Typography
                        gutterBottom
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3rem',
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
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          flexGrow: 1,
                          mb: 2,
                        }}
                      >
                        {post.data || post.content || 'No content available'}
                      </Typography>
                      
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 'auto',
                          pt: 2,
                          borderTop: 1,
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          By {post.user?.username || 'Anonymous'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                            <IconButton
                              size="small"
                              onClick={(e) => handleLikeClick(e, postId)}
                            >
                              {isLiked ? (
                                <Favorite sx={{ color: 'red', fontSize: '1.2rem' }} />
                              ) : (
                                <FavoriteBorder sx={{ fontSize: '1.2rem' }} />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Typography variant="body2" sx={{ mr: 1.5 }}>{stats.likes}</Typography>
                          
                          <Tooltip title="View Comments">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePostClick(post);
                              }}
                            >
                              <ChatBubbleOutline sx={{ fontSize: '1.2rem' }} color="action" />
                            </IconButton>
                          </Tooltip>
                          <Typography variant="body2">{stats.comments}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
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

PostsGrid.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      data: PropTypes.string,
      content: PropTypes.string,
      postImage: PropTypes.string,
      imageUrl: PropTypes.string,
      category: PropTypes.shape({ name: PropTypes.string }),
      user: PropTypes.shape({ username: PropTypes.string }),
      likedBy: PropTypes.array,
    })
  ),
};

export default PostsGrid; 