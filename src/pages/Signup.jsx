import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  CssBaseline,
  Link,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Signup = () => {
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
      const res = await api.post('/api/auth/signup', { email, password });
      if (res.data && res.data.token) {
        login(res.data.token);
        setSuccess('Signup successful! Logging you in...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else if (res.status === 200 || res.status === 201) {
        setSuccess('Signup successful! Please log in.');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(res.data?.message || 'Unexpected response.');
      }
    } catch (err) {
      if (err.response) {
        if (
          err.response.status === 400 &&
          err.response.data &&
          err.response.data.message
        ) {
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
    <Grid
      container
      component="main"
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
      }}
    >
      <CssBaseline />
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        lg={4}
        component={Paper}
        elevation={6}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
          Create an account
        </Typography>
        <Typography component="p" color="text.secondary" sx={{ mb: 3 }}>
          Enter your details to get started
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSignup}
          sx={{ mt: 1, width: '100%' }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            component="label"
            htmlFor="email"
            sx={{ display: 'block', mb: 1 , textAlign:'left' }}
          >
            Email
          </Typography>
          <TextField
            required
            fullWidth
            id="email"
            placeholder="Enter your email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            component="label"
            htmlFor="password"
            sx={{ display: 'block', mb: 1 , textAlign:'left' }}
          >
            Password
          </Typography>
          <TextField
            required
            fullWidth
            name="password"
            placeholder="Enter your password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              backgroundColor: '#1e293b',
              '&:hover': {
                backgroundColor: '#334155',
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign up'}
          </Button>
          <Typography align="center">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Signup; 