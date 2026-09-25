"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateAdminProfile, changeAdminPassword } from "@/server/actions/admin";

interface ProfileFormsProps {
  initialName: string;
}

export function ProfileForms({ initialName }: ProfileFormsProps) {
  const [name, setName] = useState(initialName);
  const [busyProfile, setBusyProfile] = useState(false);
  const [busyPassword, setBusyPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function onProfileSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusyProfile(true);
    try {
      const result = await updateAdminProfile({ name: name.trim() });
      if (result.ok) toast.success("Profile updated");
      else toast.error(result.error ?? "Could not update profile");
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusyProfile(false);
    }
  }

  async function onPasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordError(null);
    setBusyPassword(true);
    try {
      const result = await changeAdminPassword({
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword,
      });
      if (result.ok) {
        toast.success("Password changed");
        event.currentTarget.reset();
      } else {
        setPasswordError(result.error ?? "Could not change password");
      }
    } catch {
      setPasswordError("Something went wrong — please try again");
    } finally {
      setBusyPassword(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your display name as shown in the admin area and audit logs.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onProfileSubmit} className="space-y-4">
            <div>
              <Label htmlFor="admin-name">Name</Label>
              <Input id="admin-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} />
            </div>
            <Button type="submit" disabled={busyProfile}>
              {busyProfile ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Minimum 8 characters with uppercase, lowercase, number and symbol.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onPasswordSubmit} className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" name="currentPassword" type="password" required autoComplete="current-password" />
            </div>
            <div>
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" name="newPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" name="confirmPassword" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
            </div>
            {passwordError ? (
              <p className="text-sm text-red-600" role="alert">{passwordError}</p>
            ) : null}
            <Button type="submit" disabled={busyPassword}>
              {busyPassword ? "Changing…" : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
