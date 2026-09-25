"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateSettings } from "@/server/actions/admin";

interface SettingsFormProps {
  initial: Record<string, string>;
}

function Field({ id, label, value, onChange, placeholder, type = "text", hint }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(null);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validateTestimonials(raw: string): boolean {
    const trimmed = raw.trim();
    if (!trimmed) {
      setTestimonialsError(null);
      return true;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        setTestimonialsError("Must be a JSON array");
        return false;
      }
      for (const item of parsed) {
        if (typeof item !== "object" || item === null || typeof (item as Record<string, unknown>).name !== "string" || typeof (item as Record<string, unknown>).text !== "string") {
          setTestimonialsError("Each item needs at least {name, text}");
          return false;
        }
      }
      setTestimonialsError(null);
      return true;
    } catch {
      setTestimonialsError("Not valid JSON");
      return false;
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validateTestimonials(values["site.testimonials"] ?? "")) {
      toast.error("Fix the testimonials JSON before saving");
      return;
    }
    setBusy(true);
    try {
      const result = await updateSettings(values);
      if (result.ok) {
        toast.success("Settings saved");
      } else {
        toast.error(result.error ?? "Could not save settings");
      }
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Academy</CardTitle>
          <CardDescription>Brand identity shown across the site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field id="academy-name" label="Academy name" value={values["academy.name"] ?? ""} onChange={(v) => set("academy.name", v)} />
            <Field id="academy-tagline" label="Tagline" value={values["academy.tagline"] ?? ""} onChange={(v) => set("academy.tagline", v)} />
          </div>
          <div>
            <Label htmlFor="academy-collaboration">Collaboration text</Label>
            <Textarea id="academy-collaboration" value={values["academy.collaboration"] ?? ""} onChange={(e) => set("academy.collaboration", e.target.value)} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field id="contact-email" label="Contact email" type="email" value={values["contact.email"] ?? ""} onChange={(v) => set("contact.email", v)} />
          <Field id="contact-phone" label="Contact phone" value={values["contact.phone"] ?? ""} onChange={(v) => set("contact.phone", v)} hint="Format: 03XXXXXXXXX" />
          <Field id="contact-whatsapp" label="WhatsApp number" value={values["contact.whatsapp"] ?? ""} onChange={(v) => set("contact.whatsapp", v)} hint="Format: 03XXXXXXXXX" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment details</CardTitle>
          <CardDescription>Shown to students on the fee submission page.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field id="payment-accountName" label="Account name" value={values["payment.accountName"] ?? ""} onChange={(v) => set("payment.accountName", v)} />
          <Field id="payment-accountNumber" label="Account number" value={values["payment.accountNumber"] ?? ""} onChange={(v) => set("payment.accountNumber", v)} />
          <Field id="payment-methods" label="Accepted methods" value={values["payment.methods"] ?? ""} onChange={(v) => set("payment.methods", v)} hint="e.g. Easypaisa, JazzCash, Bank Transfer" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            JSON array of student testimonials. Each item needs a name and text; role and rating (1–5) are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="testimonials" className="sr-only">Testimonials JSON</Label>
          <Textarea
            id="testimonials"
            value={values["site.testimonials"] ?? ""}
            onChange={(e) => {
              set("site.testimonials", e.target.value);
              validateTestimonials(e.target.value);
            }}
            rows={8}
            className="font-mono text-xs"
            placeholder='[{"name": "Ali Raza", "role": "Web Development student", "text": "Excellent teaching!", "rating": 5}]'
          />
          {testimonialsError ? <p className="mt-1 text-xs text-red-600" role="alert">{testimonialsError}</p> : <p className="mt-1 text-xs text-emerald-600">Valid JSON</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <span>
              <span className="block text-sm font-medium text-slate-900">Email notifications</span>
              <span className="block text-xs text-slate-500">
                When off, outbound emails are skipped and logged as SKIPPED (in-app notifications still work).
              </span>
            </span>
            <input
              type="checkbox"
              checked={(values["email.notificationsEnabled"] ?? "true") !== "false"}
              onChange={(e) => set("email.notificationsEnabled", e.target.checked ? "true" : "false")}
              className="h-5 w-5 rounded border-slate-300 text-indigo-700 focus:ring-indigo-600"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field id="currency" label="Currency" value={values["currency"] ?? ""} onChange={(v) => set("currency", v)} hint="ISO code, e.g. PKR" />
          <Field id="timezone" label="Timezone" value={values["timezone"] ?? ""} onChange={(v) => set("timezone", v)} hint="e.g. Asia/Karachi" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save all settings"}
        </Button>
      </div>
    </form>
  );
}
