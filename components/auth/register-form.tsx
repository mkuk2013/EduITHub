"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, Eye, EyeOff, ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerStudent } from "@/server/actions/auth";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Client-side guards for the profile picture. The server re-validates
 * everything (type + MAX_UPLOAD_MB) — this is UX only.
 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CLIENT_MAX_BYTES = 5 * 1024 * 1024;

export function RegisterForm() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange() {
    setFileError(null);
    const file = fileInputRef.current?.files?.[0];
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError("Please choose a JPG, PNG or WebP image.");
      fileInputRef.current!.value = "";
      return;
    }
    if (file.size > CLIENT_MAX_BYTES) {
      setFileError("Image must be smaller than 5 MB.");
      fileInputRef.current!.value = "";
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fileError) {
      toast.error("Please fix the profile picture before submitting.");
      return;
    }
    setFieldErrors({});
    setFormError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await registerStudent(formData);
      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        if (result.error) {
          setFormError(result.error);
          toast.error(result.error);
        } else {
          toast.error("Please fix the highlighted fields.");
        }
        return;
      }
      toast.success("Registration submitted! Waiting for admin approval.");
      router.push(result.redirectTo ?? ROUTES.pendingApproval);
      router.refresh();
    });
  }

  const firstError = (field: string): string | undefined => fieldErrors[field]?.[0];

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Muhammad Ali"
            required
            disabled={pending}
            error={firstError("name")}
          />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={pending}
            error={firstError("email")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XXXXXXXXX"
            required
            disabled={pending}
            error={firstError("phone")}
          />
        </div>
        <div>
          <Label htmlFor="city">City (optional)</Label>
          <Input
            id="city"
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="Umerkot"
            disabled={pending}
            error={firstError("city")}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              required
              disabled={pending}
              error={firstError("password")}
              className="pr-11"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            8+ characters with uppercase, lowercase, number and symbol.
          </p>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              disabled={pending}
              error={firstError("confirmPassword")}
              className="pr-11"
            />
            <button
              type="button"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address (optional)</Label>
        <Textarea
          id="address"
          name="address"
          autoComplete="street-address"
          placeholder="House, street, area…"
          rows={2}
          disabled={pending}
          error={firstError("address")}
        />
      </div>

      <div>
        <Label htmlFor="extraInfo">Anything we should know? (optional)</Label>
        <Textarea
          id="extraInfo"
          name="extraInfo"
          placeholder="Tell us briefly about yourself or your goals…"
          rows={3}
          disabled={pending}
          error={firstError("extraInfo")}
        />
      </div>

      <div>
        <Label htmlFor="profilePicture">Profile picture (optional)</Label>
        <div
          className={cn(
            "mt-1 flex items-center gap-4 rounded-lg border border-dashed p-4",
            fileError || firstError("profilePicture")
              ? "border-red-400 bg-red-50/50"
              : "border-slate-300 bg-slate-50",
          )}
        >
          {previewUrl ? (
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Profile picture preview"
                className="h-16 w-16 rounded-full object-cover ring-2 ring-indigo-200"
              />
              <button
                type="button"
                aria-label="Remove picture"
                onClick={clearFile}
                className="absolute -right-1 -top-1 rounded-full bg-white p-0.5 text-slate-500 shadow hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <ImagePlus className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            <input
              ref={fileInputRef}
              id="profilePicture"
              name="profilePicture"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-800 disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB.</p>
          </div>
        </div>
        {fileError || firstError("profilePicture") ? (
          <p className="mt-1 text-xs text-red-600">{fileError ?? firstError("profilePicture")}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Creating your account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-medium text-indigo-700 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
