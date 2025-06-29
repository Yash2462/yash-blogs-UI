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
  Fade,
} from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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
        setTimeout(() => navigate('/posts'), 1000);
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

  return (
    <Grid
      container
      component="main"
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4ff',
        minHeight: '100vh',
      }}
    >
      <CssBaseline />
      <Fade in={true} timeout={400}>
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
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 8,
            },
          }}
        >
          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            Welcome back
          </Typography>
          <Typography component="p" color="text.secondary" sx={{ mb: 3 }}>
            Enter your credentials to access your account
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
            onSubmit={handleLogin}
            sx={{ mt: 1, width: '100%' }}
          >
            <Typography variant="subtitle1" fontWeight="bold" component="label" htmlFor="email" sx={{ display: 'block', mb: 1 , textAlign:'left' }}>Email</Typography>
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
            <Typography variant="subtitle1" fontWeight="bold" component="label" htmlFor="password" sx={{ display: 'block', mb: 1 , textAlign:'left' }}>Password</Typography>
            <TextField
              required
              fullWidth
              name="password"
              placeholder="Enter your password"
              type="password"
              id="password"
              autoComplete="current-password"
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
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#334155',
                },
              }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign in'
              )}
            </Button>
            <Typography align="center">
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/signup"
                sx={{
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: '#1e293b',
                  },
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </Grid>
      </Fade>
    </Grid>
  );
};

export default Login; 