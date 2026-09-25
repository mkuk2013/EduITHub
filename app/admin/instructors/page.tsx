import { listAdminInstructors } from "@/server/actions/admin-instructors";
import { InstructorManagement } from "@/components/admin/instructor-management";

export const metadata = {
  title: "Instructors Management | Edu IT Hub Admin",
};

export default async function AdminInstructorsPage() {
  const { instructors, allCourses } = await listAdminInstructors();

  return (
    <div className="space-y-6">
      <InstructorManagement instructors={instructors} allCourses={allCourses} />
    </div>
  );
}
