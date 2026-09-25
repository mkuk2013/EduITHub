import { getInstructorDashboardData } from "@/server/actions/instructor";
import { CourseMeetManager } from "@/components/instructor/course-meet-manager";
import { BookOpen, Users, Video, Calendar, Sparkles } from "lucide-react";

export const metadata = {
  title: "Faculty Dashboard | Edu IT Hub Academy",
};

export default async function InstructorDashboardPage() {
  const { instructor, stats } = await getInstructorDashboardData();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-900/50">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Teaching Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
              Welcome, {instructor.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl leading-relaxed">
              Manage your live classes, share Google Meet links with students, and track attendance for your assigned IT batches.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/10 min-w-[90px]">
              <BookOpen className="w-4 h-4 mx-auto text-cyan-300 mb-1" />
              <p className="text-lg font-extrabold font-mono">{stats.totalCourses}</p>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Courses</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/10 min-w-[90px]">
              <Users className="w-4 h-4 mx-auto text-amber-300 mb-1" />
              <p className="text-lg font-extrabold font-mono">{stats.totalStudents}</p>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Students</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-3.5 text-center border border-white/10 min-w-[90px]">
              <Video className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
              <p className="text-lg font-extrabold font-mono">{stats.activeSchedules}</p>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">Live Links</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses & Google Meet Links Manager */}
      <CourseMeetManager courses={instructor.courses} />
    </div>
  );
}
