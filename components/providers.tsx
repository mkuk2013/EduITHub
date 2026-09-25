"use client";

import { Toaster } from "sonner";

/**
 * Toast notifications (sonner). Rendered once in the root layout.
 * Usage anywhere (client components):  import { toast } from "sonner";
 *   toast.success("Payment submitted");
 *   toast.error("Something went wrong");
 */
export function ToastProvider() {
  return <Toaster position="top-center" richColors closeButton />;
}
