import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import * as z from "zod";

// Zod Schema
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
  previous_title_number: z.string().nonempty("Previous title number is required"),
  encumbrances: z.string().nonempty("Encumbrances is required"),
  status: z.enum(["Active", "Cancelled", "Pending", "Under Investigation"]),
  attachments: z.any().optional(),
  title_number: z.string().nonempty(),
  survey_number: z.string().nonempty(),
});

const ncrCities = [
  "Caloocan", "Las Piñas", "Makati", "Malabon", "Mandaluyong",
  "Manila", "Marikina", "Muntinlupa", "Navotas", "Parañaque",
  "Pasay", "Pasig", "Quezon City", "San Juan", "Taguig", "Valenzuela"
];

export default function LandTitleForm() {
  const [titleNumber] = useState("LT-2025-0001");
  const [surveyNumber] = useState("SN-2025-0001");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(landTitleSchema),
    defaultValues: {
      owner_name: '',
      contact_no: '',
      address: '',
      email_address: '',
      property_location: '',
      lot_number: '',
      area_size: '',
      classification: 'Residential',
      registration_date: '',
      registrar_office: '',
      previous_title_number: '',
      encumbrances: '',
      status: 'Active',
      title_number: titleNumber,
      survey_number: surveyNumber,
    }
  });

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      const attachments = data.attachments || [];
      const { attachments: _, ...payload } = data;

      formData.append("payload", JSON.stringify(payload));
      Array.from(attachments).forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await axios.post(
        "http://localhost:30081/land/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ Submitted:", response.data);
      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarSeverity("success");
        setSnackbarMessage("✅ Land registration successfully submitted!");
        setSnackbarOpen(true);
      }, 100);

      reset();
      setSelectedFiles([]);
    } catch (error) {
      console.error("❌ Submission failed:", error.response?.data || error.message);
      setSnackbarOpen(false);
      setTimeout(() => {
        setSnackbarSeverity("error");
        setSnackbarMessage("❌ Submission failed. Please try again.");
        setSnackbarOpen(true);
      }, 100);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Typography variant="h5" gutterBottom>
          Owner Information
        </Typography>

        {[{ name: "owner_name", label: "Owner Name" },
          { name: "contact_no", label: "Contact No." },
          { name: "address", label: "Address" },
          { name: "email_address", label: "Email Address" }].map(({ name, label }) => (
          <Controller
            key={name}
            name={name}
            control={control}
            render={({ field }) => (
              <TextField
                fullWidth
                margin="normal"
                label={label}
                {...field}
                error={!!errors[name]}
                helperText={errors[name]?.message}
              />
            )}
          />
        ))}

        <Typography variant="h6" mt={4}>Land Title Information</Typography>

        <Controller
          name="title_number"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              margin="normal"
              label="Title Number (Auto-generated)"
              {...field}
              value={field.value}
              disabled
            />
          )}
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

        <Controller
          name="survey_number"
          control={control}
          render={({ field }) => (
            <TextField
              fullWidth
              margin="normal"
              label="Survey Number (Auto-generated)"
              {...field}
              value={field.value}
              disabled
            />
          )}
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
            <TextField
              fullWidth
              margin="normal"
              type="date"
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
              setSelectedFiles(Array.from(e.target.files));
            }}
          />
          {selectedFiles.length > 0 && (
            <Box mt={1}>
              <Typography variant="body2">Selected Files:</Typography>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </Box>
          )}
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

<Snackbar
  open={snackbarOpen}
  autoHideDuration={3000}
  onClose={handleSnackbarClose}
  anchorOrigin={{ vertical: "top", horizontal: "center" }} // ⬆️ Top Center
  sx={{
    mt: 8, // Optional: adds spacing from very top (adjust as needed)
  }}
>
  <Alert
    onClose={handleSnackbarClose}
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
    </>
  );
}
