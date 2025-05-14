const { z } = require("zod");

const dobRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const kundaliSchema = z
  .object({
    firstName: z.string().min(1, "First-Name is required"),
    lastName: z.string().min(1, "Last-name is required"),
    dob: z.string().regex(dobRegex, "DOB must be in YYYY-MM-DD format"),
    time: z.string().regex(timeRegex, "Time must be in HH:MM 24-hour format"),
    gender: z
      .string()
      .transform((val) => val.trim().toUpperCase())
      .refine((val) => val === "MALE" || val === "FEMALE", {
        message: "Gender must be either MALE or FEMALE",
      }),
    address: z.string().min(1, "Address is required"),
  })
module.exports = {
  kundaliSchema,
};
