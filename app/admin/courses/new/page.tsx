import { PageHeader } from "@/components/ui/page-header";
import { CourseForm } from "@/components/admin/course-form";
import { getInstructors } from "@/server/actions/admin";

export const metadata = { title: "New course" };

export default async function NewCoursePage() {
  const instructors = await getInstructors();

  return (
    <div>
      <PageHeader title="New course" description="Create a course, assign instructors and build its syllabus." />
      <CourseForm initial={null} instructors={instructors} />
    </div>
  );
}
