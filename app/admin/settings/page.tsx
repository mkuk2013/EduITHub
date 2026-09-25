import { PageHeader } from "@/components/ui/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/server/actions/admin";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Academy identity, contact info, payment details, testimonials and notification preferences. All stored in the Setting table — nothing is hardcoded."
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
