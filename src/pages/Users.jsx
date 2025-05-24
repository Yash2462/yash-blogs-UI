import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import api from '../api/axios';

const Users = ({ embedded }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/users');
      let usersArray = [];
      if (Array.isArray(res.data)) {
        usersArray = res.data;
      } else if (res.data && Array.isArray(res.data.users)) {
        usersArray = res.data.users;
      } else if (res.data && Array.isArray(res.data.data)) {
        usersArray = res.data.data;
      }
      setUsers(usersArray);
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlert({ type: 'error', message: 'Failed to fetch users.' });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    setAlert({});
    setLoading(true);
    try {
      await api.delete(`/api/users/${userId}`);
      setAlert({ type: 'success', message: 'User deleted successfully!' });
      fetchUsers();
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete user.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={embedded ? 0 : 3} bgcolor="background.default">
      {!embedded && (
        <Typography variant="h4" fontWeight="bold" mb={2} color="primary.main">Users</Typography>
      )}
      {alert.message && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>
      ) : users.length === 0 ? (
        <Box textAlign="center" color="text.secondary" mt={8}>
          <Box fontSize={64} mb={2}>👤</Box>
          <Typography variant="h6">No users found.</Typography>
          <Typography variant="body2">Invite someone to join your blog!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {users.map(user => (
            <Grid item xs={12} md={6} lg={4} key={user.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{user.username}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  <Box mt={2} display="flex" gap={1}>
                    {/* Edit functionality can be added here */}
                    <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(user.id)}>Delete</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Users; 