import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Comments from './pages/Comments';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import { jwtDecode } from 'jwt-decode';
import { Box } from '@mui/material';

// Layout wrapper component
function PageWrapper({ children }) {
  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{
        pt: { xs: '64px', md: '72px' }, // Match navbar height
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
      }}>
        {children}
      </Box>
    </Box>
  );
}

function ProtectedRoute({ children }) {
  const { user, loadingUser } = useAuth();
  if (loadingUser) {
    // You can show a spinner or nothing while checking token
    return <div style={{textAlign: 'center', marginTop: '20vh'}}><span>Loading...</span></div>;
  }
  if (!user) return <Navigate to="/login" />;
  return <PageWrapper>{children}</PageWrapper>;
}

function AppRoutes() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Posts /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/comments" element={<ProtectedRoute><Comments /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
