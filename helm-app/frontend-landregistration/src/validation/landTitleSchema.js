import { z } from "zod";

const ncrCities = [
  "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong",
  "Caloocan", "Parañaque", "Las Piñas", "Pasay", "San Juan", "Marikina",
  "Valenzuela", "Malabon", "Navotas", "Pateros", "Muntinlupa"
];

export const landTitleSchema = z.object({
  owner_name: z.string().min(1, "Owner Name is required"),

  contactNo: z.string().regex(/^\d+$/, "Contact No. must be numeric"),
  address: z.string().min(1, "Address is required"),

  // Optional (auto-increment on backend)
  titleNumber: z.string().optional(),
  surveyNumber: z.string().optional(),

  propertyLocation: z.enum(ncrCities, { message: "Select a valid NCR city" }),
  lotNumber: z.coerce.number({ invalid_type_error: "Lot Number must be numeric" }),
  areaSize: z.coerce.number({ invalid_type_error: "Area Size must be numeric" }),

  classification: z.enum(["Residential", "Corporate", "Government Property"], {
    message: "Select valid classification",
  }),

  registrationDate: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date) && date.getFullYear() >= 1800;
    },
    { message: "Date must be valid and year >= 1800" }
  ),

  registrarOffice: z.enum(ncrCities, { message: "Select a valid NCR city" }),

  previousTitleNumber: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, "Must be alphanumeric"),

  encumbrances: z.string().optional(),

  status: z.string().min(1, "Status is required"),

  attachments: z
    .any()
    .refine((files) => files?.length <= 5, "Maximum of 5 attachments only"),
});