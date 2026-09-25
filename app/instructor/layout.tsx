import { requireInstructor } from "@/lib/auth";
import { InstructorHeader } from "@/components/instructor/instructor-header";
import { getInstructorDashboardData } from "@/server/actions/instructor";

export const metadata = {
  title: "Instructor Portal | Edu IT Hub Academy",
};

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireInstructor();
  const { instructor, stats } = await getInstructorDashboardData();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <InstructorHeader
        instructorName={instructor.name}
        instructorEmail={instructor.email}
        totalCourses={stats.totalCourses}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
