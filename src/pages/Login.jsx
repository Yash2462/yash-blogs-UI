import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import Signup from './Signup';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.status === 200 && res.data.token) {
        login(res.data.token);
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError('Unexpected response.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showSignup) {
    return <Signup onSwitchToLogin={() => setShowSignup(false)} embedded />;
  }
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" bgcolor="background.default">
      <Paper elevation={6} sx={{ p: 4, width: 350, bgcolor: 'background.paper' }}>
        <Typography variant="h4" mb={2} fontWeight="bold" color="primary.main" align="center">Blog App</Typography>
        <Typography variant="h5" mb={2} fontWeight="bold" color="primary.main" align="center">Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleLogin}>
          <TextField label="Email" type="email" fullWidth margin="normal" value={email} onChange={e => setEmail(e.target.value)} required />
          <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
        <Button fullWidth sx={{ mt: 2 }} onClick={() => setShowSignup(true)}>
          Don't have an account? Signup
        </Button>
      </Paper>
    </Box>
  );
};

export default Login; 