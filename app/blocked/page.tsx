import { redirect } from "next/navigation";
import { Ban, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { ROUTES } from "@/lib/constants";

/**
 * Shown to signed-in users whose account is REJECTED or SUSPENDED.
 * Middleware guarantees a session here; the guards below keep every other
 * status on its correct page.
 */
export default async function BlockedPage() {
  const user = await getSessionUser();
  if (!user) redirect(ROUTES.login);
  if (user.status === "APPROVED") {
    redirect(user.role === "ADMIN" ? ROUTES.admin : ROUTES.dashboard);
  }
  if (user.status === "PENDING_APPROVAL") {
    redirect(ROUTES.pendingApproval);
  }

  const suspended = user.status === "SUSPENDED";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 via-white to-slate-100 px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            {suspended ? <ShieldAlert className="h-7 w-7" /> : <Ban className="h-7 w-7" />}
          </span>
          <CardTitle className="text-2xl">
            {suspended ? "Account suspended" : "Registration not approved"}
          </CardTitle>
          <CardDescription>
            Signed in as {user.name} ({user.email})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {suspended ? (
            <>
              <p className="font-medium text-slate-800">
                Your account has been suspended.
              </p>
              <p className="text-sm text-slate-500">
                You currently cannot access the academy portal. If you believe
                this is a mistake, please contact our support team for a review.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-slate-800">
                Your registration was not approved.
              </p>
              <p className="text-sm text-slate-500">
                After review, your account application was declined, so you
                cannot access the student portal. If you believe this is a
                mistake, please contact us and we will take another look.
              </p>
            </>
          )}
          <LogoutButton className="w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
