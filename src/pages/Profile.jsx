import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Container,
  GlobalStyles,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [createdResponse, likedResponse] = await Promise.all([
          api.get(`/api/posts/user/${user.id}/posts`),
          api.get(`/api/posts/user/${user.id}/liked/posts`),
        ]);

        setCreatedPosts(
          createdResponse.data.posts || createdResponse.data.data || createdResponse.data || []
        );
        setLikedPosts(
          likedResponse.data.posts || likedResponse.data.data || likedResponse.data || []
        );
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setAlert({
          type: 'error',
          message: 'Failed to fetch profile data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5">Please log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <>
      {/* Custom Scrollbar Styling */}
      <GlobalStyles
        styles={{
          '*::-webkit-scrollbar': {
            width: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}
      />

      {/* Scrollable Content */}
      <Box
        sx={{
          height: 'calc(100vh - 96px)', // Adjust this based on navbar height
          overflowY: 'auto',
          pr: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              bgcolor: 'grey.100',
              borderRadius: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h4" fontWeight="bold">{user.username}</Typography>
            <Typography variant="body1" color="text.secondary">{user.email}</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{createdPosts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Total Posts</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold">{likedPosts.length}</Typography>
                <Typography variant="body2" color="text.secondary">Liked Posts</Typography>
              </Box>
            </Box>
          </Paper>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={handleTabChange} centered>
              <Tab label="My Posts" />
              <Tab label="Liked Posts" />
            </Tabs>
          </Box>

          <Box sx={{ 
            '& .MuiGrid-item': {
              '@media (min-width:900px)': { // MUI md breakpoint
                flexBasis: '50%',
                maxWidth: '50%',
              }
            } 
          }}>
            <TabPanel value={tabIndex} index={0}>
              {createdPosts.length > 0 ? (
                <PostsGrid posts={createdPosts} />
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 4 }}>
                  You have not created any posts yet.
                </Typography>
              )}
            </TabPanel>
            <TabPanel value={tabIndex} index={1}>
              {likedPosts.length > 0 ? (
                <PostsGrid posts={likedPosts} />
              ) : (
                <Typography sx={{ textAlign: 'center', mt: 4 }}>
                  You have not liked any posts yet.
                </Typography>
              )}
            </TabPanel>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Profile;
