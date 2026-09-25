import { requireStudent } from "@/lib/auth";
import { getStudentProfile } from "@/server/actions/student";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileDetailsForm, ChangePasswordForm } from "@/components/student/profile-form";
import { profileImageUrl } from "@/components/student/image-url";

export const metadata = { title: "My Profile" };

/** View and edit the signed-in student's personal details and password. */
export default async function ProfilePage() {
  await requireStudent();
  const profile = await getStudentProfile();
  const image = profileImageUrl(profile.profileImage);

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Manage your personal details and account security."
      />

      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Profile picture" className="h-full w-full object-cover" />
          ) : (
            profile.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <Badge variant="success" className="mt-1">
            {profile.status.replace(/_/g, " ")}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ProfileDetailsForm profile={profile} />
        <ChangePasswordForm />
      </div>

      <Card className="mt-6">
        <CardContent className="py-4">
          <p className="text-xs text-slate-500">
            Your data is used only for academy administration — class scheduling,
            fee verification and important announcements. Contact the academy
            office if you need to change your login email address.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
