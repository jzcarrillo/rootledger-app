// zod-schemas.js
const { z } = require("zod");

const ncrCities = [
  "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Mandaluyong",
  "Caloocan", "Parañaque", "Las Piñas", "Pasay", "San Juan", "Marikina",
  "Valenzuela", "Malabon", "Navotas", "Pateros", "Muntinlupa"
];

const landTitleSchema = z.object({
  owner_name: z.string().min(1, "Required"),
  contact_no: z.string().min(7, "Must be a valid number"),
  address: z.string().min(1, "Required"),
  email_address: z.string().email("Invalid email"),
  title_number: z.string().optional(), // will be auto-generated
  survey_number: z.string().optional(), // will be auto-generated
  property_location: z.enum(ncrCities, { required_error: "Select NCR city" }),
  lot_number: z.coerce.number({ invalid_type_error: "Lot number must be a number" }),
  area_size: z.coerce.number({ invalid_type_error: "Area size must be a number" }),

  classification: z.enum(["Residential", "Corporate", "Government Property"]),
  registration_date: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date) && date.getFullYear() >= 1900;
  }, { message: "Must be a valid date after 1900" }),

  registrar_office: z.enum(ncrCities),
  previous_title_number: z.string().optional(),
  encumbrances: z.string().optional(),
  status: z.enum(["Active", "Cancelled", "Pending", "Under Investigation"]).default("Pending"),

  attachments: z.any().optional(), // validate with multer
});

module.exports = {
  landTitleSchema
};
