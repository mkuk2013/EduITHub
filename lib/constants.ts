/**
 * Brand, route, and app-wide constants for Edu IT Hub Academy.
 * Single source of truth — do not hardcode these values elsewhere.
 */

export const BRAND = {
  name: "Edu IT Hub Academy",
  tagline: "Practical IT skills, taught live — from Umerkot to the world.",
  collaboration:
    "In collaboration with the most talented and intelligent IT specialist students and highly qualified, professional and highly experienced tutors/instructors of one of the most popular and famous institutes, Super Sys-Tech Computers Centre Umerkot.",
  colors: {
    primary: "#4338ca", // indigo-700
    dark: "#020617", // slate-950
    accent: "#fbbf24", // amber-400
  },
} as const;

export const CURRENCY = "PKR" as const;
export const TIMEZONE = "Asia/Karachi" as const;

/** All app routes in one place. Use these instead of string literals. */
export const ROUTES = {
  home: "/",
  courses: "/courses",
  courseDetail: (slug: string) => `/courses/${slug}`,
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  login: "/login",
  register: "/register",
  pendingApproval: "/pending-approval",
  blocked: "/blocked",
  dashboard: "/dashboard",
  dashboardCourse: (slug: string) => `/dashboard/courses/${slug}`,
  dashboardPayments: "/dashboard/payments",
  dashboardAnnouncements: "/dashboard/announcements",
  dashboardNotifications: "/dashboard/notifications",
  dashboardProfile: "/dashboard/profile",
  admin: "/admin",
  adminStudents: "/admin/students",
  adminCourses: "/admin/courses",
  adminEnrollments: "/admin/enrollments",
  adminPayments: "/admin/payments",
  adminVerification: "/admin/verification",
  adminApprovals: "/admin/approvals",
  adminEmails: "/admin/emails",
  adminClasses: "/admin/classes",
  adminProfile: "/admin/profile",
  adminSchedules: "/admin/schedules",
  adminAnnouncements: "/admin/announcements",
  adminNotifications: "/admin/notifications",
  adminSettings: "/admin/settings",
  adminAuditLogs: "/admin/audit-logs",
} as const;

export const PAGINATION = {
  defaultPageSize: 10,
  maxPageSize: 100,
} as const;

export const UPLOADS = {
  dir: process.env.UPLOAD_DIR ?? "./public/uploads",
  payments: "payments",
  avatars: "avatars",
  materials: "materials",
} as const;

export const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB ?? 5);

/** Setting keys seeded by prisma/seed.ts and managed under /admin/settings. */
export const SETTING_KEYS = [
  "academy.name",
  "academy.tagline",
  "academy.collaboration",
  "contact.email",
  "contact.phone",
  "contact.whatsapp",
  "payment.accountName",
  "payment.accountNumber",
  "payment.methods",
  "currency",
  "timezone",
  "email.notificationsEnabled",
  "site.testimonials",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
