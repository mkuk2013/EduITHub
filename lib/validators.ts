import { z } from "zod";

/**
 * Shared zod schemas. Every server action / API route MUST validate input
 * with the matching schema (or a stricter local extension) before touching
 * the database.
 */

// Pakistani mobile numbers: 03XXXXXXXXX (11 digits)
export const pakistaniPhoneRegex = /^03\d{9}$/;

// Minimum 8 chars, at least one lowercase, one uppercase, one digit,
// one special character.
export const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Billing month key: "2026-09"
export const monthKeyRegex = /^\d{4}-(0[1-9]|1[0-2])$/;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
    password: z
      .string()
      .regex(
        strongPasswordRegex,
        "Password must be 8+ characters with uppercase, lowercase, number and symbol",
      )
      .max(128),
    confirmPassword: z.string().min(1, "Please confirm your password").max(128),
    phone: z.string().trim().regex(pakistaniPhoneRegex, "Enter a valid Pakistani mobile number (03XXXXXXXXX)"),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    address: z.string().trim().max(500).optional().or(z.literal("")),
    extraInfo: z.string().trim().max(1000, "Keep it under 1000 characters").optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const paymentSubmissionSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  enrollmentId: z.string().min(1).optional(),
  amount: z.number().int("Amount must be a whole number").positive("Amount must be positive"),
  month: z.string().regex(monthKeyRegex, "Month must look like 2026-09"),
  paymentMethod: z.enum(["EASYPaisa", "JAZZCASH", "BANK_TRANSFER", "OTHER"]),
  transactionId: z.string().trim().min(4, "Transaction ID looks too short").max(100),
  paymentDate: z.coerce.date(),
  // proofImage is validated separately in the upload handler (type/size);
  // this is the stored relative path after a successful upload.
  proofImage: z.string().trim().max(500).optional(),
});

export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly (lowercase letters, numbers, hyphens)")
    .max(200),
  shortDescription: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
  thumbnail: z.string().trim().max(500).optional().or(z.literal("")),
  monthlyFee: z.number().int("Fee must be a whole PKR amount").min(0),
  duration: z.string().trim().min(2).max(50),
  mode: z.string().trim().min(2).max(50).default("Online"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export type CourseInput = z.infer<typeof courseSchema>;

export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  courseId: z.string().min(1).optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

/** Validate a billing month key ("2026-09"). */
export function isValidMonthKey(value: string): boolean {
  return monthKeyRegex.test(value);
}

/** Public contact form (name/email/message -> admin notifications). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
});

export type ContactInput = z.infer<typeof contactSchema>;
