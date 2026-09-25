import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { CourseForm, type CourseFormInitial } from "@/components/admin/course-form";
import { getCourseForEdit, getInstructors } from "@/server/actions/admin";

export const metadata = { title: "Edit course" };

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const [course, instructors] = await Promise.all([getCourseForEdit(id), getInstructors()]);
  if (!course) notFound();

  const initial: CourseFormInitial = {
    id: course.id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    thumbnail: course.thumbnail,
    monthlyFee: course.monthlyFee,
    duration: course.duration,
    mode: course.mode,
    status: course.status,
    requirements: course.requirements,
    benefits: course.benefits,
    instructorIds: course.instructors.map((ci) => ci.instructor.id),
    modules: course.modules.map((m) => ({ id: m.id, title: m.title, description: m.description ?? "" })),
  };

  return (
    <div>
      <PageHeader title={`Edit: ${course.title}`} description="Update course details, instructors and syllabus." />
      <CourseForm initial={initial} instructors={instructors} />
    </div>
  );
}
