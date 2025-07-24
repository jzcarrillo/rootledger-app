'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { landTitleSchema } from "../validation/landTitleSchema";
import { z } from "zod";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem
} from "@mui/material";
import axios from "axios";

// Create type based on schema
const defaultValues = {
  owner_name: "",
  contact_info: "",
  address: "",
  title_number: "",
  property_location: "",
  lot_number: "",
  survey_number: "",
  area_size: "",
  classification: "",
  registration_date: "",
  registrar_office: "",
  previous_title_number: "",
  encumbrances: "",
  status: "Active",
};

export default function LandTitleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(landTitleSchema),
    defaultValues,
  });

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("http://localhost:30081/land/register", data);
      console.log("✅ Registered:", response.data);
      alert("✅ Land Registration Successful!");
      window.location.reload();
    } catch (err) {
      console.error("❌ Error:", err.message);
      alert("❌ Registration Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h6" mt={2}>👤 Owner Information</Typography>

      <TextField fullWidth margin="normal" label="Owner Name" {...register("owner_name")} error={!!errors.owner_name} helperText={errors.owner_name?.message} />
      <TextField fullWidth margin="normal" label="Contact Info" {...register("contact_info")} error={!!errors.contact_info} helperText={errors.contact_info?.message} />
      <TextField fullWidth margin="normal" label="Address" {...register("address")} error={!!errors.address} helperText={errors.address?.message} />

      <Typography variant="h6" mt={4}>📄 Land Title Information</Typography>

      <TextField fullWidth margin="normal" label="Title Number" {...register("title_number")} error={!!errors.title_number} helperText={errors.title_number?.message} />
      <TextField fullWidth margin="normal" label="Property Location" {...register("property_location")} error={!!errors.property_location} helperText={errors.property_location?.message} />
      <TextField fullWidth margin="normal" label="Lot Number" {...register("lot_number")} error={!!errors.lot_number} helperText={errors.lot_number?.message} />
      <TextField fullWidth margin="normal" label="Survey Number" {...register("survey_number")} error={!!errors.survey_number} helperText={errors.survey_number?.message} />
      <TextField fullWidth margin="normal" label="Area Size (sqm)" {...register("area_size")} error={!!errors.area_size} helperText={errors.area_size?.message} />
      <TextField fullWidth margin="normal" label="Classification" {...register("classification")} error={!!errors.classification} helperText={errors.classification?.message} />
      <TextField fullWidth margin="normal" label="Registration Date" type="date" {...register("registration_date")} InputLabelProps={{ shrink: true }} error={!!errors.registration_date} helperText={errors.registration_date?.message} />
      <TextField fullWidth margin="normal" label="Registrar Office" {...register("registrar_office")} error={!!errors.registrar_office} helperText={errors.registrar_office?.message} />
      <TextField fullWidth margin="normal" label="Previous Title Number" {...register("previous_title_number")} error={!!errors.previous_title_number} helperText={errors.previous_title_number?.message} />
      <TextField fullWidth margin="normal" label="Encumbrances" {...register("encumbrances")} error={!!errors.encumbrances} helperText={errors.encumbrances?.message} />

      <TextField select fullWidth margin="normal" label="Status" defaultValue="Active" {...register("status")} error={!!errors.status} helperText={errors.status?.message}>
        <MenuItem value="Active">Active</MenuItem>
        <MenuItem value="Cancelled">Cancelled</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Under Investigation">Under Investigation</MenuItem>
      </TextField>

      <Box mt={3}>
        <Button type="submit" variant="contained" color="primary">
          Submit Registration
        </Button>
      </Box>
    </form>
  );
}
