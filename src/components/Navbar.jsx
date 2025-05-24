import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Slide from '@mui/material/Slide';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/posts', label: 'Posts' },
];

function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Prevent horizontal scroll on mobile by setting body overflow-x hidden
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `@media (max-width: 900px) { body { overflow-x: hidden !important; } }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <HideOnScroll>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          width: '100%',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 72 },
            width: '100%',
            px: { xs: 2, md: 3 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxSizing: 'border-box',
          }}
        >
          {/* Left: Blog App title */}
          <Typography
            variant="h5"
            component={NavLink}
            to="/dashboard"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 1,
              color: 'primary.main',
              textDecoration: 'none',
              fontSize: { xs: 22, md: 26 },
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            Blog App
          </Typography>

          {/* Nav links and logout (desktop) */}
          {!isMobile && user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navLinks.map(link => (
                <Button
                  key={link.to}
                  component={NavLink}
                  to={link.to}
                  sx={({ isActive }) => ({
                    color: isActive ? 'primary.main' : 'text.secondary',
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? '2px solid' : '2px solid transparent',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    borderRadius: '2px',
                    px: 2,
                    py: 1,
                    background: 'none',
                    textTransform: 'none',
                    fontSize: 16,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderColor: isActive ? 'primary.main' : 'rgba(0, 0, 0, 0.12)',
                    },
                  })}
                >
                  {link.label}
                </Button>
              ))}
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogout} 
                sx={{ 
                  ml: 1,
                  borderRadius: 2, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 3,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {/* Hamburger menu (mobile) */}
          {isMobile && user && (
            <>
              <IconButton 
                edge="end" 
                color="inherit" 
                aria-label="menu" 
                onClick={() => setDrawerOpen(true)} 
                sx={{ 
                  fontSize: 24,
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <MenuIcon fontSize="inherit" />
              </IconButton>
              <Drawer 
                anchor="right" 
                open={drawerOpen} 
                onClose={() => setDrawerOpen(false)}
                PaperProps={{ 
                  sx: { 
                    width: '100%', 
                    maxWidth: 300,
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    boxShadow: 3,
                    height: '100%',
                    top: 0,
                    right: 0,
                  } 
                }}
                sx={{
                  '& .MuiDrawer-paper': {
                    top: 0,
                    height: '100%',
                  },
                  '& .MuiBackdrop-root': {
                    top: 0,
                    height: '100%',
                  }
                }}
                ModalProps={{
                  container: document.body,
                  style: { position: 'absolute' }
                }}
              >
                <Box 
                  sx={{ 
                    width: '100%', 
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }} 
                  role="presentation" 
                  onClick={() => setDrawerOpen(false)}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 3,
                    }}
                  >
                    Menu
                  </Typography>
                  <List sx={{ flex: 1 }}>
                    {navLinks.map(link => (
                      <ListItem key={link.to} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton 
                          component={NavLink} 
                          to={link.to} 
                          sx={({ isActive }) => ({
                            py: 1.5,
                            borderRadius: 2,
                            backgroundColor: isActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.08)',
                            }
                          })}
                        >
                          <ListItemText 
                            primary={link.label} 
                            primaryTypographyProps={{ 
                              fontSize: 16,
                              fontWeight: 500,
                            }} 
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleLogout} 
                    sx={{ 
                      width: '100%', 
                      py: 1.5, 
                      fontWeight: 600, 
                      fontSize: 16,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              </Drawer>
            </>
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar; 