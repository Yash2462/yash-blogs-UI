import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
    primary: {
      main: '#212121', // black
    },
    secondary: {
      main: '#757575', // grey
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff', // Ensures white background for filled input
          '&:hover': {
            backgroundColor: '#fff',
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff', // Ensures white background for outlined input
          '&:hover': {
            backgroundColor: '#fff',
          },
          '&.Mui-focused': {
            backgroundColor: '#fff',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          backgroundColor: '#fff', // Ensures white background for the input element itself
          '&:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px white inset', // Fix for autofill background color
            WebkitTextFillColor: '#212121', // Ensures black text color on autofill
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          // Targets the standard variant of TextField
          backgroundColor: '#fff', // Ensures white background for standard input
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: '2px solid rgba(0, 0, 0, 0.42)', // Default hover border color for standard
          },
          '&.Mui-focused:after': {
            borderBottomColor: '#212121', // Primary color for focus border
          },
          '&:before': {
            borderBottom: '1px solid rgba(0, 0, 0, 0.42)', // Default border color for standard
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
