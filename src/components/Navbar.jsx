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
import { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Home, Add, Person, Logout } from '@mui/icons-material';
import SvgIcon from '@mui/material/SvgIcon';

const navLinks = [
  { to: '/posts', label: 'Home', icon: <Home sx={{ fontSize: 20 }} /> },
  { to: '/create-post', label: 'Write', icon: <Add sx={{ fontSize: 20 }} /> },
  { to: '/profile', label: 'Profile', icon: <Person sx={{ fontSize: 20 }} /> },
];

function BlogSpaceIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v2H7v-2.15c0-1.69 1.36-3.05 3.05-3.05h.9c.35 0 .68.06.99.16l2.1 6.3c-.63.29-1.31.48-2.04.57zM17.05 18c-.31-.63-.7-1.19-1.14-1.69l-2.01-2.01c.2-.7.3-1.44.3-2.22 0-3.31-2.69-6-6-6-.05 0-.09.01-.14.01L6.1 4.2c1.58-.79 3.39-1.2 5.3-1.2 4.41 0 8 3.59 8 8 0 1.98-.71 3.78-1.87 5.17l-.18.23z" />
    </SvgIcon>
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

  const drawer = (
    <Box onClick={() => setDrawerOpen(false)} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, fontWeight: 'bold' }}>
        BlogSpace
      </Typography>
      <Divider />
      <List>
        {navLinks.map((item) => (
          <ListItem key={item.to} disablePadding>
            <ListItemButton sx={{ textAlign: 'left' }} component={NavLink} to={item.to}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {item.icon}
                <ListItemText primary={item.label} />
              </Box>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Button
        fullWidth
        variant="text"
        onClick={handleLogout}
        sx={{
          justifyContent: 'flex-start',
          gap: 2,
          p: '10px 16px',
          textTransform: 'none',
          color: 'text.secondary',
        }}
      >
        <Logout sx={{ fontSize: 20 }} />
        Logout
      </Button>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <Box
            component={NavLink}
            to="/posts"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexBasis: { xs: 'auto', md: '200px' },
              flexShrink: 0,
            }}
          >
            <BlogSpaceIcon sx={{ color: '#4A90E2', mr: 1, fontSize: 32 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
              BlogSpace
            </Typography>
          </Box>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <>
              <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 1 }}>
                {navLinks.map((item) => (
                  <Button
                    key={item.label}
                    component={NavLink}
                    to={item.to}
                    startIcon={item.icon}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      fontWeight: 500,
                      '&.active': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
              <Box sx={{ flexBasis: '200px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                  sx={{ borderRadius: 20, textTransform: 'none' }}
                >
                  Logout
                </Button>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
};

export default Navbar; 