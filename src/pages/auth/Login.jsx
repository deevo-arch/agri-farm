import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ mobile: '', password: '', role: 'farmer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.mobile, formData.password, formData.role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, bgcolor: 'grey.50' }}>
      <Card sx={{ maxWidth: 440, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" color="primary.main" gutterBottom>Agri Farm</Typography>
            <Typography variant="subtitle1" color="text.secondary">Sign in to your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              inputProps={{ autoComplete: 'tel' }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              inputProps={{ autoComplete: 'current-password' }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select name="role" value={formData.role} label="Role" onChange={handleChange}>
                <MenuItem value="farmer">Farmer</MenuItem>
                <MenuItem value="vet">Veterinarian</MenuItem>
                <MenuItem value="authority">Authority</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Don't have an account? <Link to="/signup" sx={{ color: 'primary.main', fontWeight: 500 }}>Sign up</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;