import { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, IconButton } from '@mui/material';
import api from '../api/axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CategoryForm = ({ open, onClose, onSubmit, category, loading }) => {
  const [name, setName] = useState(category?.name || '');

  useEffect(() => {
    setName(category?.name || '');
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="category-dialog-title">
      <DialogTitle id="category-dialog-title">{category ? 'Edit Category' : 'Create Category'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField label="Name" fullWidth margin="normal" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : (category ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Categories = ({ embedded }) => {
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [fetching, setFetching] = useState(true);

  const fetchCategories = async () => {
    setFetching(true);
    try {
      const res = await api.get('/api/category');
      let arr = [];
      if (Array.isArray(res.data)) arr = res.data;
      else if (res.data && Array.isArray(res.data.categories)) arr = res.data.categories;
      else if (res.data && Array.isArray(res.data.data)) arr = res.data.data;
      setCategories(arr);
    } catch {
      setAlert({ type: 'error', message: 'Failed to fetch categories.' });
      setCategories([]);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (data) => {
    setLoading(true);
    setAlert({});
    try {
      await api.post('/api/category', data);
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Category created successfully!' });
      fetchCategories();
    } catch {
      setAlert({ type: 'error', message: 'Failed to create category.' });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = async (data) => {
    setLoading(true);
    setAlert({});
    try {
      await api.put(`/api/category/${editingCategory.id}`, { ...editingCategory, ...data });
      setEditingCategory(null);
      setOpenForm(false);
      setAlert({ type: 'success', message: 'Category updated successfully!' });
      fetchCategories();
    } catch {
      setAlert({ type: 'error', message: 'Failed to update category.' });
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (categoryId) => {
    setLoading(true);
    setAlert({});
    try {
      await api.delete(`/api/category/${categoryId}`);
      setAlert({ type: 'success', message: 'Category deleted successfully!' });
      fetchCategories();
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete category.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={embedded ? 0 : 3} bgcolor="background.default">
      {!embedded && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" fontWeight="bold" color="primary.main">Categories</Typography>
          <Button variant="contained" color="primary" onClick={() => { setEditingCategory(null); setOpenForm(true); }}>Create Category</Button>
        </Box>
      )}
      {alert.message && <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>}
      {fetching ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>
      ) : !Array.isArray(categories) || categories.length === 0 ? (
        <Box textAlign="center" color="text.secondary" mt={8}>
          <Box fontSize={64} mb={2}>📂</Box>
          <Typography variant="h6">No categories yet.</Typography>
          <Typography variant="body2">Create your first category to get started!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map(category => (
            <Grid item xs={12} md={6} lg={4} key={category.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, bgcolor: 'background.paper', p: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h6" color="primary.main">{category.name}</Typography>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton color="primary" onClick={() => { setEditingCategory(category); setOpenForm(true); }} aria-label="Edit category">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(category.id)} aria-label="Delete category">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <CategoryForm
        open={openForm}
        onClose={() => { setOpenForm(false); setEditingCategory(null); }}
        onSubmit={editingCategory ? handleEdit : handleCreate}
        category={editingCategory}
        loading={loading}
      />
    </Box>
  );
};

export default Categories; 