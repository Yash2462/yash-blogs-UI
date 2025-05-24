import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Signup = ({ onSwitchToLogin, embedded }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/signup', { username, email, password });
      if (res.data && res.data.token) {
        login(res.data.token);
        setSuccess('Signup successful! Logging you in...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else if (res.status === 200 || res.status === 201) {
        setSuccess('Signup successful! Please log in.');
        setTimeout(() => {
          if (onSwitchToLogin) onSwitchToLogin();
          else navigate('/login');
        }, 1500);
      } else {
        setError(res.data?.message || 'Unexpected response.');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 400 && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.status === 302) {
          setError('User already exists. Please log in.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Signup failed.');
        }
      } else {
        setError('Network error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={embedded ? undefined : '80vh'} bgcolor="background.default">
      <Paper elevation={6} sx={{ p: 4, width: 350, bgcolor: 'background.paper' }}>
        <Typography variant="h4" mb={2} fontWeight="bold" color="primary.main" align="center">Blog App</Typography>
        <Typography variant="h5" mb={2} fontWeight="bold" color="primary.main" align="center">Signup</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSignup}>
          <TextField label="Username" fullWidth margin="normal" value={username} onChange={e => setUsername(e.target.value)} required />
          <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Signup'}
          </Button>
        </form>
        <Button fullWidth sx={{ mt: 2 }} onClick={onSwitchToLogin}>
          Already have an account? Login
        </Button>
      </Paper>
    </Box>
  );
};

export default Signup; 