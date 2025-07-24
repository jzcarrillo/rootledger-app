import { z } from "zod";

export const landTitleSchema = z.object({
  owner_name: z.string().min(1, "Owner Name is required"),
  contact_info: z.string().min(1, "Contact Info is required"),
  address: z.string().min(1, "Address is required"),

  title_number: z.string().min(1, "Title Number is required"),
  property_location: z.string().min(1, "Property Location is required"),
  lot_number: z.string().min(1, "Lot Number is required"),
  survey_number: z.string().min(1, "Survey Number is required"),
  area_size: z.string().min(1, "Area Size is required"),
  classification: z.string().min(1, "Classification is required"),
  registration_date: z.string().min(1, "Registration Date is required"),
  registrar_office: z.string().min(1, "Registrar Office is required"),
  previous_title_number: z.string().min(1, "Previous Title Number is required"),
  encumbrances: z.string().min(1, "Encumbrances is required"),
  status: z.string().min(1, "Status is required"),
});
