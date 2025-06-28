import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Fade,
  Container,
  GlobalStyles
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  FiberManualRecord,
  Visibility,
  VisibilityOff,
  Save,
  Publish,
  ArrowBack,
  Image,
  Category,
  Description,
  Title,
  AccessTime,
  Edit,
  AutoAwesome,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const publishingTips = [
  {
    icon: <Title />,
    title: 'Compelling Title',
    description: 'Write a title that grabs attention and clearly describes your content'
  },
  {
    icon: <Description />,
    title: 'Engaging Excerpt',
    description: 'Keep your excerpt concise and make readers want to continue'
  },
  {
    icon: <Image />,
    title: 'Quality Image',
    description: 'Add a high-quality featured image that represents your content'
  },
  {
    icon: <Category />,
    title: 'Right Category',
    description: 'Choose the most relevant category for better discoverability'
  },
  {
    icon: <Edit />,
    title: 'Clear Formatting',
    description: 'Use clear paragraphs and formatting for better readability'
  }
];

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    data: '',
    categoryId: '',
    postImage: ''
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setCategoriesLoading(true);
    api.get('/api/category')
      .then(res => {
        const categoriesData = res.data.categories || res.data.data || res.data || [];
        setCategories(categoriesData);
      })
      .catch(() => setSnackbar({ open: true, message: 'Failed to fetch categories', severity: 'error' }))
      .finally(() => setCategoriesLoading(false));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.data || !formData.categoryId) {
      setError('Please fill in all required fields');
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/api/posts/user/${user.id}/category/${formData.categoryId}`, formData);
      setSnackbar({ open: true, message: 'Post created successfully!', severity: 'success' });
      setFormData({ title: '', excerpt: '', data: '', categoryId: '', postImage: '' });
      setIsDirty(false);
      
      setTimeout(() => {
        navigate(`/post/${response.data.id || response.data.post?.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating post:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to create post. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => String(cat.id) === String(formData.categoryId));
  const wordCount = formData.data ? formData.data.split(/\s+/).filter(word => word.length > 0).length : 0;
  const charCount = formData.data ? formData.data.length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const getValidationStatus = () => {
    const hasTitle = formData.title.trim().length > 0;
    const hasContent = formData.data.trim().length > 0;
    const hasCategory = formData.categoryId !== '';
    const hasExcerpt = formData.excerpt.trim().length > 0;
    const hasImage = formData.postImage.trim().length > 0;

    return {
      title: hasTitle,
      content: hasContent,
      category: hasCategory,
      excerpt: hasExcerpt,
      image: hasImage,
      isComplete: hasTitle && hasContent && hasCategory
    };
  };

  const validation = getValidationStatus();

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          'body': {
            overflowY: 'auto',
            height: 'auto'
          },
          'html': {
            height: 'auto'
          },
          '*::-webkit-scrollbar': {
            width: '6px',
          },
          '*::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '*::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '10px',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
        }}
      />
      
      <Box sx={{ 
        background: '#f0f4ff',
        py: 3,
        flex: 1,
        overflowY: 'auto'
      }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            pb: 5,
            maxWidth: { lg: '1200px', xl: '1400px' },
            mx: 'auto'
          }}
        >
          {/* Simple Header */}
          <Box sx={{ 
            mb: 3, 
            textAlign: { xs: 'center', lg: 'left' },
            maxWidth: { lg: '1000px' },
            mx: { lg: 'auto' }
          }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/posts')}
              sx={{ mb: 2, color: '#1e293b' }}
            >
              Back to Posts
            </Button>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
              Create New Post
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Share your thoughts with the world
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ maxWidth: { lg: '1000px' }, mx: { lg: 'auto' } }}>
            {/* Main Form Area */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'visible', background: 'white' }}>
                <Box sx={{ p: { xs: 2, sm: 3, lg: 4 } }}>
                  {!previewMode ? (
                    <form onSubmit={handleSubmit}>
                      <Stack spacing={3}>
                        {/* Post Stats */}
                        <Card elevation={1} sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}>
                          <CardContent sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
                              Post Statistics
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} sm={3}>
                                <Box textAlign="center" sx={{ p: 1 }}>
                                  <Typography variant="h6" fontWeight={700} color="#1e293b">
                                    {wordCount}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Words
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box textAlign="center" sx={{ p: 1 }}>
                                  <Typography variant="h6" fontWeight={700} color="#1e293b">
                                    {charCount}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Characters
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box textAlign="center" sx={{ p: 1 }}>
                                  <Typography variant="h6" fontWeight={700} color="#1e293b">
                                    {readingTime}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Min Read
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6} sm={3}>
                                <Box textAlign="center" sx={{ p: 1 }}>
                                  <Typography variant="h6" fontWeight={700} color={validation.isComplete ? "#4caf50" : "#f44336"}>
                                    {validation.isComplete ? "Ready" : "Draft"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Status
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>

                        {/* Title Field */}
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" component="label" sx={{ display: 'block', mb: 1, textAlign: 'left' }}>
                            Post Title
                          </Typography>
                          <TextField
                            name="title"
                            fullWidth
                            value={formData.title}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            placeholder="Enter a compelling title for your post..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '1rem', sm: '1.1rem' },
                                fontWeight: 500,
                                minHeight: { xs: '45px', sm: '50px' },
                                '&:hover fieldset': {
                                  borderColor: '#1e293b',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1e293b',
                                },
                              },
                            }}
                          />
                        </Box>

                        {/* Excerpt Field */}
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" component="label" sx={{ display: 'block', mb: 1, textAlign: 'left' }}>
                            Post Excerpt
                          </Typography>
                          <TextField
                            name="excerpt"
                            fullWidth
                            value={formData.excerpt}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            variant="outlined"
                            size="small"
                            placeholder="Write a brief description that will appear in previews..."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '0.9rem', sm: '0.95rem' },
                                '&:hover fieldset': {
                                  borderColor: '#1e293b',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1e293b',
                                },
                              },
                            }}
                          />
                        </Box>

                        {/* Content Field */}
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold" component="label" sx={{ display: 'block', mb: 1, textAlign: 'left' }}>
                            Post Content
                          </Typography>
                          <TextField
                            name="data"
                            fullWidth
                            value={formData.data}
                            onChange={handleChange}
                            multiline
                            rows={12}
                            variant="outlined"
                            size="small"
                            placeholder="Write your post content here... Use paragraphs to organize your thoughts."
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                                '&:hover fieldset': {
                                  borderColor: '#1e293b',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1e293b',
                                },
                              },
                            }}
                          />
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Button
                            startIcon={previewMode ? <Edit /> : <Visibility />}
                            onClick={handlePreviewToggle}
                            variant="outlined"
                            sx={{ 
                              borderColor: '#1e293b',
                              color: '#1e293b',
                              '&:hover': { borderColor: '#475569', backgroundColor: '#f1f5f9' }
                            }}
                          >
                            {previewMode ? 'Exit Preview' : 'Preview Post'}
                          </Button>
                          
                          <Button
                            startIcon={<Save />}
                            variant="contained"
                            disabled={!isDirty || isLoading}
                            onClick={handleSubmit}
                            sx={{ 
                              backgroundColor: '#1e293b',
                              '&:hover': { backgroundColor: '#334155' },
                              '&:disabled': { backgroundColor: '#cbd5e1' }
                            }}
                          >
                            {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Publish Post'}
                          </Button>
                        </Box>
                      </Stack>
                    </form>
                  ) : (
                    <Box>
                      <Fade in={true} timeout={500}>
                        <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            {/* Exit Preview Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                Preview Mode
                              </Typography>
                              <Button
                                startIcon={<Edit />}
                                onClick={handlePreviewToggle}
                                variant="outlined"
                                size="small"
                                sx={{ 
                                  borderColor: '#1e293b',
                                  color: '#1e293b',
                                  '&:hover': { borderColor: '#475569', backgroundColor: '#f1f5f9' }
                                }}
                              >
                                Exit Preview
                              </Button>
                            </Box>
                            
                            {selectedCategory && (
                              <Chip 
                                label={selectedCategory.name} 
                                color="primary" 
                                sx={{ mb: 2 }}
                                icon={<Category />}
                              />
                            )}
                            
                            <Typography variant="h4" fontWeight={600} gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', lg: '2.5rem' } }}>
                              {formData.title || 'Your Post Title'}
                            </Typography>
                            
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                              {formData.excerpt || 'Your post excerpt will appear here...'}
                            </Typography>
                            
                            {formData.postImage && (
                              <Box sx={{ mb: 3 }}>
                                <img 
                                  src={formData.postImage} 
                                  alt="preview" 
                                  style={{ 
                                    width: '100%', 
                                    borderRadius: 12, 
                                    maxHeight: 400,
                                    objectFit: 'cover'
                                  }} 
                                />
                              </Box>
                            )}
                            
                            <Divider sx={{ my: 3 }} />
                            
                            <Box sx={{ 
                              whiteSpace: 'pre-wrap', 
                              bgcolor: '#fafafa', 
                              p: { xs: 2, sm: 3 }, 
                              borderRadius: 2,
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.7
                            }}>
                              {formData.data || 'Your post content will appear here...'}
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={2}>
                {/* Post Settings */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                      <AutoAwesome sx={{ color: '#1e293b' }} />
                      Settings
                    </Typography>
                    
                    <FormControl fullWidth margin="normal" size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.categoryId}
                        label="Category"
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        disabled={categoriesLoading}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: validation.category ? '#4caf50' : '#f44336',
                          },
                        }}
                      >
                        {categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="Featured Image URL"
                      name="postImage"
                      fullWidth
                      margin="normal"
                      size="small"
                      value={formData.postImage}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: formData.postImage ? '#4caf50' : '#e0e0e0',
                        },
                      }}
                    />
                  </CardContent>
                </Card>

                {/* Status Indicators */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                      <CheckCircle sx={{ color: '#1e293b' }} />
                      Status
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {validation.title ? <CheckCircle color="success" fontSize="small" /> : <Warning color="error" fontSize="small" />}
                          <Typography variant="body2">Title</Typography>
                        </Box>
                        <Typography variant="caption" color={validation.title ? "success.main" : "error.main"}>
                          {validation.title ? "✓" : "!"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {validation.content ? <CheckCircle color="success" fontSize="small" /> : <Warning color="error" fontSize="small" />}
                          <Typography variant="body2">Content</Typography>
                        </Box>
                        <Typography variant="caption" color={validation.content ? "success.main" : "error.main"}>
                          {validation.content ? "✓" : "!"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {validation.category ? <CheckCircle color="success" fontSize="small" /> : <Warning color="error" fontSize="small" />}
                          <Typography variant="body2">Category</Typography>
                        </Box>
                        <Typography variant="caption" color={validation.category ? "success.main" : "error.main"}>
                          {validation.category ? "✓" : "!"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {validation.excerpt ? <CheckCircle color="success" fontSize="small" /> : <Info color="info" fontSize="small" />}
                          <Typography variant="body2">Excerpt</Typography>
                        </Box>
                        <Typography variant="caption" color={validation.excerpt ? "success.main" : "info.main"}>
                          {validation.excerpt ? "✓" : "○"}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          {validation.image ? <CheckCircle color="success" fontSize="small" /> : <Info color="info" fontSize="small" />}
                          <Typography variant="body2">Image</Typography>
                        </Box>
                        <Typography variant="caption" color={validation.image ? "success.main" : "info.main"}>
                          {validation.image ? "✓" : "○"}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Publishing Tips */}
                <Collapse in={showTips}>
                  <Card elevation={2} sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
                          <Info sx={{ color: '#1e293b' }} />
                          Tips
                        </Typography>
                        <IconButton size="small" onClick={() => setShowTips(false)}>
                          <ExpandLess />
                        </IconButton>
                      </Box>
                      
                      <List dense sx={{ py: 0 }}>
                        {publishingTips.map((tip, index) => (
                          <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>
                              {tip.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={tip.title}
                              secondary={tip.description}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Collapse>

                {/* Quick Actions */}
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ pb: 2, px: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
                      <Save sx={{ color: '#1e293b' }} />
                      Actions
                    </Typography>
                    
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => setFormData({ title: '', excerpt: '', data: '', categoryId: '', postImage: '' })}
                        disabled={!isDirty}
                        sx={{ 
                          borderColor: '#1e293b',
                          color: '#1e293b',
                          '&:hover': { borderColor: '#475569', backgroundColor: '#f1f5f9' }
                        }}
                      >
                        Clear Form
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreatePost;