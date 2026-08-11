import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const roleFields = {
  farmer: [
    { name: 'farm_name', label: 'Farm Name', required: true },
    { name: 'address', label: 'Farm Address', required: true, multiline: true },
    { name: 'latitude', label: 'Latitude', type: 'number', step: 'any', required: true },
    { name: 'longitude', label: 'Longitude', type: 'number', step: 'any', required: true },
    { name: 'total_animals', label: 'Total Animals', type: 'number', defaultValue: 0 },
  ],
  vet: [
    { name: 'clinic_name', label: 'Clinic/Hospital Name', required: true },
    { name: 'address', label: 'Clinic Address', required: true, multiline: true },
    { name: 'latitude', label: 'Latitude', type: 'number', step: 'any', required: true },
    { name: 'longitude', label: 'Longitude', type: 'number', step: 'any', required: true },
    { name: 'license_number', label: 'License Number', required: true },
    { name: 'specialization', label: 'Specialization' },
  ],
  authority: [
    { name: 'department', label: 'Department', type: 'select', options: ['Milk Collection', 'Quality Control', 'Regulatory/Inspection'], required: true },
    { name: 'organization_name', label: 'Organization Name', required: true },
    { name: 'employee_id', label: 'Employee ID', required: true },
  ],
};

const Signup = () => {
  const [formData, setFormData] = useState({
    full_name: '', mobile: '', email: '', password: '', confirmPassword: '', role: 'farmer',
    farm_name: '', address: '', latitude: '', longitude: '', total_animals: 0,
    clinic_name: '', license_number: '', specialization: '',
    department: '', organization_name: '', employee_id: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const submitData = { ...formData };
      delete submitData.confirmPassword;
      await signup(submitData);
      navigate('/farmer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentRoleFields = roleFields[formData.role] || [];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4, bgcolor: 'grey.50' }}>
      <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" color="primary.main" gutterBottom>Agri Farm</Typography>
            <Typography variant="subtitle1" color="text.secondary">Create your account</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email (Optional)" name="email" type="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select name="role" value={formData.role} label="Role" onChange={handleChange}>
                    <MenuItem value="farmer">Farmer</MenuItem>
                    <MenuItem value="vet">Veterinarian</MenuItem>
                    <MenuItem value="authority">Authority</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
              </Grid>
            </Grid>

            {currentRoleFields.map((field) => (
              <Grid item xs={12} key={field.name} sx={{ mb: 1 }}>
                {field.type === 'select' ? (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select name={field.name} value={formData[field.name]} label={field.label} onChange={handleChange} required={field.required}>
                      {field.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </FormControl>
                ) : field.multiline ? (
                  <TextField fullWidth multiline rows={3} label={field.label} name={field.name} value={formData[field.name]} onChange={handleChange} required={field.required} />
                ) : (
                  <TextField fullWidth label={field.label} name={field.name} type={field.type || 'text'} value={formData[field.name]} onChange={handleChange} required={field.required} />
                )}
              </Grid>
            ))}

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center', display: 'block' }}>
            Already have an account? <Link to="/login" sx={{ color: 'primary.main', fontWeight: 500 }}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Signup;