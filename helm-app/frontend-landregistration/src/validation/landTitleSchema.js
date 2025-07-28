import { z } from "zod";

export const landTitleSchema = z.object({
  owner_name: z.string().min(1, "Owner name is required"),
  contact_no: z
    .string()
    .min(7, "Contact number must be at least 7 digits")
    .max(15, "Contact number too long"),
  address: z.string().min(1, "Address is required"),
  email_address: z.string().email("Invalid email address"),

  title_number: z.string().optional(), // auto-generated
  property_location: z.enum([
    "Manila", "Quezon City", "Caloocan", "Makati", "Pasig", "Taguig",
    "Mandaluyong", "Pasay", "Parañaque", "Las Piñas", "Muntinlupa",
    "Malabon", "Navotas", "Valenzuela", "San Juan", "Marikina", "Pateros"
  ], {
    required_error: "Property location is required",
  }),

  lot_number: z.coerce.number().int().positive("Lot number must be a positive number"),
  survey_number: z.string().optional(), // auto-generated
  area_size: z.coerce.number().positive("Area size must be a positive number"),

  classification: z.enum(["Residential", "Corporate", "Government Property"], {
    required_error: "Classification is required",
  }),

  registration_date: z
    .string()
    .refine(val => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date.getFullYear() >= 1900;
    }, {
      message: "Date must be after 1900",
    }),

  registrar_office: z.enum([
    "Manila", "Quezon City", "Caloocan", "Makati", "Pasig", "Taguig",
    "Mandaluyong", "Pasay", "Parañaque", "Las Piñas", "Muntinlupa",
    "Malabon", "Navotas", "Valenzuela", "San Juan", "Marikina", "Pateros"
  ], {
    required_error: "Registrar Office is required",
  }),

  previous_title_number: z.string().min(1, "Previous title number is required"),
  encumbrances: z.string().min(1, "Encumbrances are required"),
  status: z.enum(["Active", "Cancelled", "Pending", "Under Investigation"]),

  attachments: z.any().optional(), // handled by multer
});
