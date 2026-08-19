import { z } from "zod";

export const bookAppointmentSchema = z.object({
  locationId: z.string().min(1, "Location is required"),
  serviceId: z.string().min(1, "Service is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  age: z
    .number({ error: "Age must be a number" })
    .int()
    .positive("Age must be a positive number")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["MALE", "FEMALE"], { error: "Select a gender" }),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?\d[\d\s-]{7,14}\d)$/, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const appointmentStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
});

export const rescheduleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.number().nonnegative().optional().nullable(),
  estimatedDuration: z.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const blockedDateSchema = z.object({
  locationId: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().max(300).optional().or(z.literal("")),
});

export const workingHourSchema = z.object({
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
  breakEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable().or(z.literal("")),
  slotMinutes: z.number().int().min(5).max(180),
});

export const weeklyScheduleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  isAvailable: z.boolean(),
});
