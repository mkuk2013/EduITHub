"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { submitContactMessage, type ContactFormState } from "@/server/actions/site";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Public contact form. Submits via the `submitContactMessage` server action
 * (zod-validated, rate-limited); outcome is reported with sonner toasts and
 * field-level errors are shown inline.
 */
export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ContactFormState>({ ok: false });
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const input = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    startTransition(async () => {
      const result = await submitContactMessage(input);
      setState(result);
      if (result.ok) {
        toast.success("Message sent — our team will get back to you soon.");
        setFormKey((k) => k + 1);
        setState({ ok: false });
      } else if (!result.errors) {
        toast.error(result.message ?? "Could not send your message — please try again.");
      } else {
        toast.error("Please fix the highlighted fields and try again.");
      }
    });
  };

  return (
    <form key={formKey} onSubmit={handleSubmit} noValidate aria-label="Contact form">
      <div className="space-y-4">
        <div>
          <Label htmlFor="contact-name">Your name</Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Ali Raza"
            required
            disabled={pending}
            error={state.errors?.name}
            maxLength={100}
          />
        </div>
        <div>
          <Label htmlFor="contact-email">Email address</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={pending}
            error={state.errors?.email}
            maxLength={255}
          />
        </div>
        <div>
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            placeholder="How can we help you?"
            required
            disabled={pending}
            error={state.errors?.message}
            rows={5}
            maxLength={2000}
          />
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full sm:w-auto">
          <Send className="h-4 w-4" aria-hidden="true" />
          {pending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
