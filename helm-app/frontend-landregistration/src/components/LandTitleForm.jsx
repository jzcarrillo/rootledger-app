'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { landTitleSchema } from "../validation/landTitleSchema";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";
import axios from "axios";

const ncrCities = [
  "Manila", "Quezon City", "Caloocan", "Makati", "Pasig", "Taguig",
  "Mandaluyong", "Pasay", "Parañaque", "Las Piñas", "Muntinlupa",
  "Malabon", "Navotas", "Valenzuela", "San Juan", "Marikina", "Pateros"
];

const defaultValues = {
  owner_name: "",
  contactNo: "",
  address: "",
  email_address: "",
  title_number: "",
  propertyLocation: "",
  lotNumber: "",
  survey_number: "",
  areaSize: "",
  classification: "",
  registrationDate: "",
  registrarOffice: "",
  previousTitleNumber: "",
  encumbrances: "",
  status: "Active",
  attachments: null,
};

export default function LandTitleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    resolver: zodResolver(landTitleSchema),
    defaultValues
  });

  const onSubmit = async (data) => {
    const formData = new FormData();

    const files = watch("attachments");
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        formData.append("attachments", file);
      });
    }

    for (const key in data) {
      if (key !== "attachments") {
        formData.append(key, data[key]);
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:30081/land/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("✅ Registered:", response.data);
      alert("✅ Land Registration Successful!");
      reset();
      window.location.reload();
    } catch (err) {
      console.error("❌ Error:", err.message);
      alert("❌ Registration Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
      <Typography variant="h6" mt={2}>👤 Owner Information</Typography>

      <TextField fullWidth margin="normal" label="Owner Name" {...register("owner_name")} error={!!errors.owner_name} helperText={errors.owner_name?.message} />
      <TextField fullWidth margin="normal" label="Contact Info" {...register("contactNo")} error={!!errors.contactNo} helperText={errors.contactNo?.message} />
      <TextField fullWidth margin="normal" label="Address" {...register("address")} error={!!errors.address} helperText={errors.address?.message} />
      <TextField fullWidth margin="normal" label="Email Address" {...register("email_address")} error={!!errors.email_address} helperText={errors.email_address?.message} />

      <Typography variant="h6" mt={4}>📄 Land Title Information</Typography>

      <TextField fullWidth margin="normal" label="Title Number (Auto-generated)" value={watch("title_number") ?? ''} disabled />
      
      <TextField select fullWidth margin="normal" label="Property Location" {...register("propertyLocation")} error={!!errors.propertyLocation} helperText={errors.propertyLocation?.message}>
        {ncrCities.map(city => (
          <MenuItem key={city} value={city}>{city}</MenuItem>
        ))}
      </TextField>

      <TextField fullWidth margin="normal" label="Lot Number" {...register("lotNumber")} error={!!errors.lotNumber} helperText={errors.lotNumber?.message} />
      <TextField fullWidth margin="normal" label="Survey Number (Auto-generated)" value={watch("survey_number") ?? ''} disabled />
      <TextField fullWidth margin="normal" label="Area Size (sqm)" {...register("areaSize")} error={!!errors.areaSize} helperText={errors.areaSize?.message} />

      <TextField select fullWidth margin="normal" label="Classification" {...register("classification")} error={!!errors.classification} helperText={errors.classification?.message}>
        <MenuItem value="Residential">Residential</MenuItem>
        <MenuItem value="Corporate">Corporate</MenuItem>
        <MenuItem value="Government Property">Government Property</MenuItem>
      </TextField>

      <TextField
        fullWidth
        margin="normal"
        label="Registration Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        {...register("registrationDate")}
        error={!!errors.registrationDate}
        helperText={errors.registrationDate?.message}
      />

      <TextField select fullWidth margin="normal" label="Registrar Office" {...register("registrarOffice")} error={!!errors.registrarOffice} helperText={errors.registrarOffice?.message}>
        {ncrCities.map(city => (
          <MenuItem key={city} value={city}>{city}</MenuItem>
        ))}
      </TextField>

      <TextField fullWidth margin="normal" label="Previous Title Number" {...register("previousTitleNumber")} error={!!errors.previousTitleNumber} helperText={errors.previousTitleNumber?.message} />
      <TextField fullWidth margin="normal" label="Encumbrances" {...register("encumbrances")} error={!!errors.encumbrances} helperText={errors.encumbrances?.message} />

      <TextField select fullWidth margin="normal" label="Status" defaultValue="Active" {...register("status")} error={!!errors.status} helperText={errors.status?.message}>
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Cancelled">Cancelled</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Under Investigation">Under Investigation</MenuItem>
      </TextField>

      <Typography variant="h6" mt={4}>📎 Attachments</Typography>
      <Box mb={2}>
        <input
          type="file"
          accept="application/pdf,image/*"
          multiple
          {...register("attachments")}
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
