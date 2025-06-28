import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Alert,
  IconButton,
  Container,
  Chip,
  Tooltip,
} from '@mui/material';
import api from '../api/axios';
import CommentsDrawer from '../components/CommentsDrawer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

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

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get('/api/posts');
        let postsArray = [];
        if (Array.isArray(res.data)) {
          postsArray = res.data;
        } else if (res.data && Array.isArray(res.data.posts)) {
          postsArray = res.data.posts;
        } else if (res.data && Array.isArray(res.data.data)) {
          postsArray = res.data.data;
        }
        
        const foundPost = postsArray.find(p => 
          String(p._id) === String(postId) || 
          String(p.id) === String(postId) || 
          String(p.postId) === String(postId)
        );
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <Box 
        sx={{
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          pt: { xs: '64px', md: '72px' },
          pb: 4
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          p: 2,
          pt: { xs: '64px', md: '72px' },
          pb: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ 
            position: 'absolute',
            top: { xs: '72px', md: '80px' },
            left: 16,
            zIndex: 1,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ mt: 6 }}>{error}</Alert>
      </Box>
    );
  }

  if (!post) {
    return (
      <Box 
        sx={{ 
          p: 2,
          pt: { xs: '64px', md: '72px' },
          pb: 4,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ 
            position: 'absolute',
            top: { xs: '72px', md: '80px' },
            left: 16,
            zIndex: 1,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="info" sx={{ mt: 6 }}>Post not found</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        pt: { xs: '64px', md: '72px' },
        pb: 4,
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{ 
          position: 'fixed',
          top: { xs: '72px', md: '80px' },
          left: 16,
          zIndex: 1,
          bgcolor: 'background.paper',
          boxShadow: 1,
          '&:hover': {
            bgcolor: 'background.paper',
            boxShadow: 2,
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 4 },
            bgcolor: 'background.paper',
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            {post.title}
          </Typography>

          {post.postImage && (
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
                src={post.postImage}
                alt={post.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '400px',
                  objectFit: 'contain',
                }}
              />
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Chip
              label={post.category?.name || 'Uncategorized'}
              color="primary"
              size="small"
            />
          </Box>

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
              {post.data}
            </ReactMarkdown>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
            By {post.user?.username || 'Unknown'} in {post.category?.name || 'Uncategorized'}
          </Typography>

          <Box mt={3}>
            <Button 
              variant="contained" 
              onClick={() => setCommentsOpen(true)}
              sx={{
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
              }}
            >
              View Comments
            </Button>
          </Box>
        </Paper>
      </Container>

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={postId}
      />
    </Box>
  );
};

export default PostDetail; 