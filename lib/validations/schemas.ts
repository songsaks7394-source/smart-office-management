import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address"),
    department: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export const repairRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Please describe the issue in more detail"),
  location: z.string().min(2, "Location is required"),
});

export const equipmentRequestSchema = z.object({
  itemName: z.string().min(2, "Item name is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().min(5, "Please provide a reason"),
});

export const borrowRequestSchema = z.object({
  assetName: z.enum(["Laptop", "Mouse", "Keyboard", "Monitor", "Projector"]),
  borrowDate: z.string().min(1, "Borrow date is required"),
  dueDate: z.string().min(1, "Return-by date is required"),
});

export const roomBookingSchema = z.object({
  roomId: z.string().min(1, "Please select a room"),
  bookingDate: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  purpose: z.string().optional(),
});
