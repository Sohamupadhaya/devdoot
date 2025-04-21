const { z } = require("zod");

const phoneRegex = /^\d{10}$/;
const dobRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(phoneRegex, "Phone must be 10 digits"),
  dob: z.string().regex(dobRegex, "DOB must be in YYYY-MM-DD format"),
  address: z.string().min(1, "Address is required"),
  gender: z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val === "MALE" || val === "FEMALE", {
      message: "Gender must be either MALE or FEMALE",
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const verifySchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().min(1, "OTP is required"),
});

const resendOTPSchema = z.object({
  email: z.string().email("Invalid email"),
});

module.exports = {
  userSchema,
  verifySchema,
  resendOTPSchema
};
