import { requireStudent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUnreadCount } from "@/server/actions/notifications";
import { DashboardNav } from "@/components/student/dashboard-nav";
import { profileImageUrl } from "@/components/student/image-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * Authenticated student shell: guards with requireStudent(), then renders
 * the sidebar / mobile navigation and the page content.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

  const [profile, unreadCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        studentProfile: { select: { profileImage: true } },
      },
    }),
    getUnreadCount().catch(() => 0),
  ]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNav
        userName={profile?.name ?? user.name}
        profileImageUrl={profileImageUrl(profile?.studentProfile?.profileImage)}
        unreadCount={unreadCount}
      />
      <div className="lg:pl-64 xl:pl-72 min-h-screen transition-all duration-300">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
