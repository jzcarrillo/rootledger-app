'use client';

import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, MenuItem } from '@mui/material';
import axios from 'axios';

export default function LandRegistration() {
  const [formData, setFormData] = useState({
    owner_name: '',
    contact_info: '',
    address: '',
    title_number: '',
    property_location: '',
    lot_number: '',
    survey_number: '',
    area_size: '',
    classification: '',
    registration_date: '',
    registrar_office: '',
    previous_title_number: '',
    encumbrances: '',
    status: 'Active',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:30081/land/register', formData);
      console.log('✅ Registered:', response.data);
      alert('✅ Land Registration Successful!');
    } catch (err) {
      console.error('❌ Registration failed:', err.message);
      alert('❌ Registration Failed');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Land Title Registration
      </Typography>

      <Typography variant="h6" mt={2}>👤 Owner Information</Typography>

      <TextField label="Owner Name" name="owner_name" fullWidth margin="normal" value={formData.owner_name} onChange={handleChange} />
      <TextField label="Contact Info" name="contact_info" fullWidth margin="normal" value={formData.contact_info} onChange={handleChange} />
      <TextField label="Address" name="address" fullWidth margin="normal" value={formData.address} onChange={handleChange} />

      <Typography variant="h6" mt={4}>📄 Land Title Information</Typography>

      <TextField label="Title Number" name="title_number" fullWidth margin="normal" value={formData.title_number} onChange={handleChange} />
      <TextField label="Property Location" name="property_location" fullWidth margin="normal" value={formData.property_location} onChange={handleChange} />
      <TextField label="Lot Number" name="lot_number" fullWidth margin="normal" value={formData.lot_number} onChange={handleChange} />
      <TextField label="Survey Number" name="survey_number" fullWidth margin="normal" value={formData.survey_number} onChange={handleChange} />
      <TextField label="Area Size (sqm)" name="area_size" fullWidth margin="normal" value={formData.area_size} onChange={handleChange} />
      <TextField label="Classification" name="classification" fullWidth margin="normal" value={formData.classification} onChange={handleChange} />
      <TextField type="date" name="registration_date" fullWidth margin="normal" value={formData.registration_date} onChange={handleChange} InputLabelProps={{ shrink: true }} label="Registration Date" />
      <TextField label="Registrar Office" name="registrar_office" fullWidth margin="normal" value={formData.registrar_office} onChange={handleChange} />
      <TextField label="Previous Title Number" name="previous_title_number" fullWidth margin="normal" value={formData.previous_title_number} onChange={handleChange} />
      <TextField label="Encumbrances" name="encumbrances" fullWidth margin="normal" value={formData.encumbrances} onChange={handleChange} />

      <TextField
        select
        label="Status"
        name="status"
        fullWidth
        margin="normal"
        value={formData.status}
        onChange={handleChange}
      >
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Cancelled">Cancelled</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Under Investigation">Under Investigation</MenuItem>
      </TextField>

      <Box mt={3}>
        <Button variant="contained" onClick={handleSubmit}>
          Submit Registration
        </Button>
      </Box>
    </Container>
  );
}
