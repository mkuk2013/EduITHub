import Link from "next/link";
import { Mail, Globe, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";
import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { CURRENCY, TIMEZONE } from "@/lib/constants";

export const metadata = { title: "Settings" };

/**
 * Account settings. Only real, persisted information is shown —
 * notification preferences have no backing model, so no toggles are
 * faked here (see report for QA).
 */
export default async function SettingsPage() {
  const user = await requireStudent();

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["currency", "timezone"] } },
    select: { key: true, value: true },
  });
  const currency = settings.find((s) => s.key === "currency")?.value || CURRENCY;
  const timezone = settings.find((s) => s.key === "timezone")?.value || TIMEZONE;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your account information and preferences."
      />

      <div className="flex flex-col gap-6">
        {/* Account information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Details tied to your student account.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" /> Login email
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{user.email}</dd>
                <dd className="mt-1 text-xs text-slate-500">
                  Your email is your login identity and cannot be changed from here.
                </dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" /> Region
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {timezone} · {currency}
                </dd>
                <dd className="mt-1 text-xs text-slate-500">
                  Dates are shown in academy time; fees are billed in {currency}.
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-700" aria-hidden="true" />
              Account Security
            </CardTitle>
            <CardDescription>Keep your account protected.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={`${ROUTES.dashboardProfile}#change-password`}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <span className="flex items-center gap-3">
                <KeyRound className="h-5 w-5 text-slate-400" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-medium text-slate-900">Change password</span>
                  <span className="block text-xs text-slate-500">
                    Update the password you use to sign in.
                  </span>
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              Never share your password. Academy staff will never ask for it by
              phone, email or WhatsApp.
            </p>
          </CardContent>
        </Card>

        {/* Notifications note — honest, no fake toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>How you hear from the academy.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Important updates — enrollment approvals, payment decisions and
              class announcements — appear in your{" "}
              <Link href={ROUTES.dashboardNotifications} className="font-medium text-indigo-700 hover:underline">
                Notifications inbox
              </Link>
              . There are no per-device preferences to configure on this screen.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
