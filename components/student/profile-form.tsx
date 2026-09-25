"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProfile,
  changePassword,
  type StudentProfileData,
} from "@/server/actions/student";

/** View/edit personal details + profile picture (updateProfile). */
export function ProfileDetailsForm({ profile }: { profile: StudentProfileData }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setErrors({});
    setPending(true);
    try {
      const result = await updateProfile(new FormData(event.currentTarget));
      if (result.ok) {
        toast.success("Profile updated successfully.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Could not save — please try again.");
      }
    } catch {
      toast.error("Could not save — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Details</CardTitle>
        <CardDescription>
          Keep your contact information up to date so the academy can reach you about classes and fees.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" name="name" defaultValue={profile.name} maxLength={100} required />
          </div>
          <div>
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" value={profile.email} disabled />
            <p className="mt-1 text-xs text-slate-500">Your login email cannot be changed here.</p>
          </div>
          <div>
            <Label htmlFor="profile-phone">Phone (03XXXXXXXXX)</Label>
            <Input
              id="profile-phone"
              name="phone"
              inputMode="numeric"
              placeholder="03XXXXXXXXX"
              defaultValue={profile.phone}
              maxLength={20}
              error={errors.phone}
            />
          </div>
          <div>
            <Label htmlFor="profile-city">City</Label>
            <Input id="profile-city" name="city" defaultValue={profile.city} maxLength={100} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="profile-address">Address</Label>
            <Textarea id="profile-address" name="address" defaultValue={profile.address} maxLength={500} rows={2} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="profile-extra">About / extra information</Label>
            <Textarea id="profile-extra" name="extraInfo" defaultValue={profile.extraInfo} maxLength={2000} rows={3} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="profile-image">Profile picture</Label>
            <Input id="profile-image" name="profileImage" type="file" accept="image/*" />
            <p className="mt-1 text-xs text-slate-500">
              JPG or PNG, up to 5 MB. Uploading a new picture replaces the current one.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              <Save className="h-4 w-4" aria-hidden="true" />
              {pending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Password change with current-password verification (changePassword). */
export function ChangePasswordForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setErrors({});
    setPending(true);
    try {
      const result = await changePassword(new FormData(event.currentTarget));
      if (result.ok) {
        toast.success("Password changed successfully.");
        event.currentTarget.reset();
      } else {
        toast.error(result.error ?? "Could not change the password — please try again.");
      }
    } catch {
      toast.error("Could not change the password — please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card id="change-password">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Use at least 8 characters with uppercase, lowercase, a number and a symbol.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="grid max-w-xl gap-5">
          <div>
            <Label htmlFor="pw-current">Current password</Label>
            <Input id="pw-current" name="currentPassword" type="password" autoComplete="current-password" required error={errors.currentPassword} />
          </div>
          <div>
            <Label htmlFor="pw-new">New password</Label>
            <Input id="pw-new" name="newPassword" type="password" autoComplete="new-password" required error={errors.newPassword} />
          </div>
          <div>
            <Label htmlFor="pw-confirm">Confirm new password</Label>
            <Input id="pw-confirm" name="confirmPassword" type="password" autoComplete="new-password" required error={errors.confirmPassword} />
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {pending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
