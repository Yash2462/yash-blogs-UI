import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
} from '@mui/material';

const PostsGrid = ({ posts = [], onPostClick }) => {
  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        flex: 1,
        overflow: 'auto',
        px: 3,
        pb: 3,
        pt: 3,
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        '-ms-overflow-style': 'none',
        'scrollbarWidth': 'none',
      }}>
        {!posts ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography>No posts found.</Typography>
          </Box>
        ) : (
          <Grid 
            container 
            spacing={3} 
            sx={{
              width: '100%',
              margin: 0,
            }}
          >
            {posts.map(post => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={post.postId} display="flex" justifyContent="center">
                <Card
                  sx={{
                    cursor: 'pointer',
                    minHeight: 340,
                    maxHeight: 340,
                    height: 340,
                    minWidth: 270,
                    maxWidth: 320,
                    width: '100%',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px) scale(1.03)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => onPostClick && onPostClick(post)}
                >
                  {post.postImage && (
                    <CardMedia 
                      component="img" 
                      height="140" 
                      image={post.postImage} 
                      alt={post.title} 
                      sx={{ 
                        objectFit: 'cover', 
                        minHeight: 140, 
                        maxHeight: 140 
                      }} 
                    />
                  )}
                  <CardContent sx={{ 
                    p: 2, 
                    flex: 1, 
                    minHeight: 120, 
                    maxHeight: 120, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between' 
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {post.data?.slice(0, 60)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      By {post.user?.username || 'Unknown'} in {post.category?.name || 'Uncategorized'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default PostsGrid; 