import { redirect } from "next/navigation";
import { Hourglass } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { ROUTES } from "@/lib/constants";

/**
 * Shown to signed-in users whose account is still PENDING_APPROVAL.
 * Middleware guarantees a session here; the guards below keep every other
 * status on its correct page.
 */
export default async function PendingApprovalPage() {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);
  if (user.status === "APPROVED") {
    redirect(user.role === "ADMIN" ? ROUTES.admin : ROUTES.dashboard);
  }
  if (user.status === "REJECTED" || user.status === "SUSPENDED") {
    redirect(ROUTES.blocked);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50 via-white to-slate-100 px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <Hourglass className="h-7 w-7" />
          </span>
          <CardTitle className="text-2xl">Registration received</CardTitle>
          <CardDescription>
            Signed in as {user.name} ({user.email})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium text-slate-800">
            Your registration has been submitted successfully and is waiting for
            admin approval.
          </p>
          <p className="text-sm text-slate-500">
            Our team reviews every registration manually. You will get full
            access to your student dashboard as soon as your account is
            approved — this page will update automatically the next time you
            sign in.
          </p>
          <LogoutButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
