import { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import api from '../api/axios';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Tooltip title={copied ? "Copied!" : "Copy code"}>
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            position: 'absolute',
            right: 6,
            top: 6,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '4px',
            minWidth: '24px',
            width: '24px',
            height: '24px',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s ease-in-out',
            zIndex: 1,
          }}
        >
          {copied ? <CheckIcon sx={{ fontSize: '16px', color: '#4CAF50' }} /> : <ContentCopyIcon sx={{ fontSize: '16px', color: '#fff' }} />}
        </IconButton>
      </Tooltip>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '4px',
          padding: '2.5rem 1rem 1rem 1rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </Box>
  );
};

const PostForm = ({ open, onClose, onSubmit, post, loading = false }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.data || '');
  const [categoryId, setCategoryId] = useState(post?.category?.id || '');
  const [postImage, setPostImage] = useState(post?.postImage || '');
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.data || '');
      setCategoryId(post.category?.id || '');
      setPostImage(post.postImage || '');
    } else {
      // Reset form when creating new post
      setTitle('');
      setContent('');
      setCategoryId('');
      setPostImage('');
    }
  }, [post, open]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/api/category');
      const categoriesData = Array.isArray(res.data) 
        ? res.data 
        : res.data.categories || res.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setError('');
      await onSubmit({
        title,
        data: content,
        categoryId,
        postImage,
      });
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle>
        {post ? 'Edit Post' : 'Create New Post'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            error={!title && error}
            helperText={!title && error ? 'Title is required' : ''}
          />
          <TextField
            label="Image URL"
            fullWidth
            margin="normal"
            value={postImage}
            onChange={(e) => setPostImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <FormControl fullWidth margin="normal" required error={!categoryId && error}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryId}
              label="Category"
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categoriesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading categories...
                </MenuItem>
              ) : categories.length === 0 ? (
                <MenuItem value="" disabled>
                  No categories available
                </MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {!categoryId && error && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                Please select a category
              </Box>
            )}
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Write" />
              <Tab label="Preview" />
            </Tabs>

            <Box sx={{ mt: 2, height: '400px', overflow: 'auto' }}>
              {activeTab === 0 ? (
                <MDEditor
                  value={content}
                  onChange={setContent}
                  preview="edit"
                  height={400}
                />
              ) : (
                <Paper sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
                  <Typography variant="h4" gutterBottom>
                    {title || 'Untitled Post'}
                  </Typography>
                  
                  {postImage && (
                    <Box 
                      mb={3}
                      sx={{
                        borderRadius: 1,
                        overflow: 'hidden',
                        boxShadow: 1,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <img 
                        src={postImage} 
                        alt={title} 
                        style={{ 
                          width: '100%',
                          height: 'auto',
                          maxHeight: '300px',
                          objectFit: 'contain',
                        }} 
                      />
                    </Box>
                  )}

                  <Box sx={{ 
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      mt: 3,
                      mb: 2,
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'left',
                      width: '100%',
                      display: 'block',
                      textAlignLast: 'left',
                    },
                    '& h1': { fontSize: '2rem' },
                    '& h2': { fontSize: '1.75rem' },
                    '& h3': { fontSize: '1.5rem' },
                    '& h4': { fontSize: '1.25rem' },
                    '& h5': { fontSize: '1.1rem' },
                    '& h6': { fontSize: '1rem' },
                    '& p': {
                      mb: 2,
                      lineHeight: 1.6,
                      maxWidth: '100%',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                      hyphens: 'auto',
                    },
                    '& ul, & ol': {
                      mb: 2,
                      pl: 3,
                      maxWidth: '100%',
                    },
                    '& li': {
                      mb: 1,
                      maxWidth: '100%',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                    },
                    '& blockquote': {
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      pl: 2,
                      py: 1,
                      my: 2,
                      backgroundColor: 'grey.50',
                      fontStyle: 'italic',
                      maxWidth: '100%',
                      overflowWrap: 'break-word',
                      wordWrap: 'break-word',
                    },
                    '& table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      my: 2,
                      maxWidth: '100%',
                      overflowX: 'auto',
                      display: 'block',
                    },
                    '& th, & td': {
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1,
                      minWidth: '100px',
                    },
                    '& th': {
                      backgroundColor: 'grey.100',
                      fontWeight: 600,
                    },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      wordBreak: 'break-word',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    },
                    '& pre': {
                      maxWidth: '100%',
                      overflowX: 'auto',
                    },
                    '& code': {
                      maxWidth: '100%',
                      overflowX: 'auto',
                    },
                  }}>
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, '')}
                              {...props}
                            />
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
                    {selectedCategory ? `Category: ${selectedCategory.name}` : 'No category selected'}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !title || !content || !categoryId}
          type="submit"
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : post ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostForm; 