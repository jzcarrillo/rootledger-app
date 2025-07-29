import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";

// Zod schema
const landTitleSchema = z.object({
  owner_name: z.string().nonempty("Owner name is required"),
  contact_no: z.string().nonempty("Contact number is required"),
  address: z.string().nonempty("Address is required"),
  email_address: z.string().email("Invalid email address"),
  property_location: z.string().nonempty("Property location is required"),
  lot_number: z.string().nonempty("Lot number is required"),
  area_size: z.string().nonempty("Area size is required"),
  classification: z.enum(["Residential", "Corporate", "Government Property"]),
  registration_date: z.string().refine((date) => {
    const d = new Date(date);
    return d.getFullYear() > 1900;
  }, { message: "Date must be after 1900" }),
  registrar_office: z.string().nonempty("Registrar office is required"),
  previous_title_number: z.string().nonempty("Previous Title number is required"),
  encumbrances: z.string().nonempty("Previous Title number is required"),
  status: z.enum(["Active", "Cancelled", "Pending", "Under Investigation"]),
  attachments: z.any().optional(),
});

const ncrCities = [
  "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong",
  "Manila", "Marikina", "Muntinlupa", "Navotas", "Parañaque",
  "Pasay", "Pasig", "Quezon City", "San Juan", "Taguig", "Valenzuela"
];

export default function LandTitleForm() {
  const [titleNumber] = useState("LT-2025-0001"); // example only
  const [surveyNumber] = useState("SN-2025-0001"); // example only

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(landTitleSchema),
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'attachments' && Array.isArray(value)) {
          Array.from(value).forEach((file) => formData.append('attachments', file));
        } else {
          formData.append(key, value);
        }
      });

          // 🛠️ Add missing fields manually
    formData.append("title_number", titleNumber);
    formData.append("survey_number", surveyNumber);

      const response = await axios.post(
        'http://localhost:30081/land/register',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Land title registered successfully!');
        window.location.reload(); // refresh page after success
      } else {
        console.error("Unexpected response:", response);
        alert('Submission failed. Unexpected server response.');
      }

    } catch (error) {
      console.error('❌ Submission failed:', error);
      alert('Submission failed. Check console for details.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      <Typography variant="h5" gutterBottom>
        Owner Information
      </Typography>

      <Controller
        name="owner_name"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Owner Name" {...field}
            error={!!errors.owner_name}
            helperText={errors.owner_name?.message}
          />
        )}
      />

      <Controller
        name="contact_no"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Contact No." {...field}
            error={!!errors.contact_no}
            helperText={errors.contact_no?.message}
          />
        )}
      />

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Address" {...field}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
        )}
      />

      <Controller
        name="email_address"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Email Address" {...field}
            error={!!errors.email_address}
            helperText={errors.email_address?.message}
          />
        )}
      />

      <Typography variant="h6" mt={4}>Land Title Information</Typography>

      <TextField
        fullWidth
        margin="normal"
        label="Title Number (Auto-generated)"
        value={titleNumber}
        disabled
      />

      <Controller
        name="property_location"
        control={control}
        render={({ field }) => (
          <TextField select fullWidth margin="normal" label="Property Location" {...field}
            error={!!errors.property_location}
            helperText={errors.property_location?.message}
          >
            {ncrCities.map((city) => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="lot_number"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Lot Number" {...field}
            error={!!errors.lot_number}
            helperText={errors.lot_number?.message}
          />
        )}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Survey Number (Auto-generated)"
        value={surveyNumber}
        disabled
      />

      <Controller
        name="area_size"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Area Size (sqm)" {...field}
            error={!!errors.area_size}
            helperText={errors.area_size?.message}
          />
        )}
      />

      <Controller
        name="classification"
        control={control}
        render={({ field }) => (
          <TextField select fullWidth margin="normal" label="Classification" {...field}
            error={!!errors.classification}
            helperText={errors.classification?.message}
          >
            <MenuItem value="Residential">Residential</MenuItem>
            <MenuItem value="Corporate">Corporate</MenuItem>
            <MenuItem value="Government Property">Government Property</MenuItem>
          </TextField>
        )}
      />

      <Controller
        name="registration_date"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" type="date"
            label="Registration Date"
            InputLabelProps={{ shrink: true }}
            {...field}
            error={!!errors.registration_date}
            helperText={errors.registration_date?.message}
          />
        )}
      />

      <Controller
        name="registrar_office"
        control={control}
        render={({ field }) => (
          <TextField select fullWidth margin="normal" label="Registrar Office" {...field}
            error={!!errors.registrar_office}
            helperText={errors.registrar_office?.message}
          >
            {ncrCities.map((city) => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="previous_title_number"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Previous Title Number" {...field}
            error={!!errors.previous_title_number}
            helperText={errors.previous_title_number?.message}
          />
        )}
      />

      <Controller
        name="encumbrances"
        control={control}
        render={({ field }) => (
          <TextField fullWidth margin="normal" label="Encumbrances" {...field}
            error={!!errors.encumbrances}
            helperText={errors.encumbrances?.message}
          />
        )}
      />

      <Controller
        name="status"
        control={control}
        defaultValue="Active"
        render={({ field }) => (
          <TextField select fullWidth margin="normal" label="Status" {...field}
            error={!!errors.status}
            helperText={errors.status?.message}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Under Investigation">Under Investigation</MenuItem>
          </TextField>
        )}
      />

      <Typography variant="h6" mt={4}>Attachments</Typography>
      <Box mb={2}>
        <input
          type="file"
          accept="application/pdf,image/*"
          multiple
          onChange={(e) => {
            setValue("attachments", e.target.files);
          }}
        />
        {errors.attachments && (
          <Typography variant="caption" color="error">
            {errors.attachments.message}
          </Typography>
        )}
      </Box>

      <Box mt={3}>
        <Button type="submit" variant="contained" color="primary">
          Submit Registration
        </Button>
      </Box>
    </form>
  );
}
