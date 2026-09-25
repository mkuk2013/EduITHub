"use client";

import { useState, useTransition } from "react";
import {
  Video,
  VideoOff,
  Users,
  Clock,
  Calendar,
  ExternalLink,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Sparkles,
  BookOpen,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCourseGoogleMeet, getCourseStudents } from "@/server/actions/instructor";

interface ScheduleData {
  id?: string;
  meetingUrl?: string | null;
  days: string[];
  startTime: string;
  endTime: string;
  timezone?: string;
  instructions?: string | null;
}

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  duration: string;
  mode: string;
  status: string;
  schedule?: ScheduleData | null;
  _count: {
    enrollments: number;
  };
}

interface CourseMeetManagerProps {
  courses: Array<{
    course: CourseItem;
  }>;
}

const AVAILABLE_DAYS = [
  { id: "Mon", label: "Monday" },
  { id: "Tue", label: "Tuesday" },
  { id: "Wed", label: "Wednesday" },
  { id: "Thu", label: "Thursday" },
  { id: "Fri", label: "Friday" },
  { id: "Sat", label: "Saturday" },
  { id: "Sun", label: "Sunday" },
];

export function CourseMeetManager({ courses }: CourseMeetManagerProps) {
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for Meet URL
  const [meetingUrl, setMeetingUrl] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>(["Mon", "Wed", "Fri"]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("19:30");
  const [instructions, setInstructions] = useState("");

  // Roster modal states
  const [rosterCourse, setRosterCourse] = useState<CourseItem | null>(null);
  const [rosterStudents, setRosterStudents] = useState<any[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  function openMeetEditor(course: CourseItem) {
    setSelectedCourse(course);
    setMeetingUrl(course.schedule?.meetingUrl || "");
    setSelectedDays(course.schedule?.days && course.schedule.days.length > 0 ? course.schedule.days : ["Mon", "Wed", "Fri"]);
    setStartTime(course.schedule?.startTime || "18:00");
    setEndTime(course.schedule?.endTime || "19:30");
    setInstructions(course.schedule?.instructions || "");
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  function handleDayToggle(dayId: string) {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  }

  function handleSaveMeet(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await updateCourseGoogleMeet({
        courseId: selectedCourse.id,
        meetingUrl,
        days: selectedDays,
        startTime,
        endTime,
        instructions,
      });

      if (!res.ok) {
        setErrorMsg(res.error || "Failed to update Google Meet link");
      } else {
        setSuccessMsg("Google Meet link shared! Enrolled students have been notified.");
        // Update local object
        selectedCourse.schedule = {
          ...selectedCourse.schedule,
          meetingUrl,
          days: selectedDays,
          startTime,
          endTime,
          instructions,
        };
        setTimeout(() => setSelectedCourse(null), 1500);
      }
    });
  }

  async function openRosterModal(course: CourseItem) {
    setRosterCourse(course);
    setLoadingRoster(true);
    try {
      const students = await getCourseStudents(course.id);
      setRosterStudents(students);
    } catch {
      setRosterStudents([]);
    } finally {
      setLoadingRoster(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold font-heading text-slate-900">
            Assigned Courses & Live Google Meet Links
          </h2>
          <p className="text-xs text-slate-500">
            Share and update live class links. Your enrolled students will see them directly in their student dashboard.
          </p>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(({ course }) => {
          const hasMeet = Boolean(course.schedule?.meetingUrl && course.schedule.meetingUrl.trim().length > 0);

          return (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Course Header & Live Meet Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <BookOpen className="w-3 h-3" />
                    <span>{course.duration}</span>
                  </span>

                  {hasMeet ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Meet Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      No Link Yet
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold font-heading text-slate-900 leading-snug">
                  {course.title}
                </h3>

                {/* Schedule Summary */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="font-medium">
                      {course.schedule?.days?.length ? course.schedule.days.join(", ") : "Days not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      {course.schedule ? `${course.schedule.startTime} – ${course.schedule.endTime} (PKT)` : "Time not set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <button
                      type="button"
                      onClick={() => openRosterModal(course)}
                      className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                    >
                      {course._count.enrollments} Enrolled Students
                    </button>
                  </div>
                </div>

                {/* Google Meet URL Preview */}
                {hasMeet ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2">
                    <div className="truncate text-xs font-mono text-slate-700 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{course.schedule?.meetingUrl}</span>
                    </div>
                    <a
                      href={course.schedule?.meetingUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 p-1 shrink-0"
                      title="Test Google Meet link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                    Students are waiting for class link
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  onClick={() => openMeetEditor(course)}
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5" />
                  {hasMeet ? "Update Meet Link" : "Set Google Meet Link"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Share / Update Meet Link Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 font-heading text-sm sm:text-base">
                    Live Class Link: {selectedCourse.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Instantly syncs to enrolled students&apos; portals
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMeet} className="p-6 space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Google Meet URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Google Meet URL (or Zoom / Teams) <span className="text-rose-500">*</span></span>
                  {meetingUrl && (
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  required
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full h-10.5 rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 font-mono focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <p className="text-[10px] text-slate-400">
                  Tip: Create a meeting on meet.google.com and paste the link here.
                </p>
              </div>

              {/* Days Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-700">Class Days</label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_DAYS.map((d) => {
                    const isSelected = selectedDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDayToggle(d.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Start Time (PKT)</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">End Time (PKT)</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Instructions / Class Note */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-slate-700">
                  Class Announcement / Student Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please join 5 mins before class. Have VS Code & node installed."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourse(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {isPending ? "Sharing Link..." : "Save & Share Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrolled Students Roster Modal */}
      {rosterCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 font-heading text-sm sm:text-base">
                  Enrolled Students: {rosterCourse.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Total {rosterStudents.length} Students Enrolled
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRosterCourse(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingRoster ? (
                <div className="py-12 text-center text-xs text-slate-500">Loading student roster...</div>
              ) : rosterStudents.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No students enrolled yet.</div>
              ) : (
                <div className="space-y-2">
                  {rosterStudents.map((enr) => (
                    <div
                      key={enr.id}
                      className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{enr.student.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {enr.student.email}
                          </span>
                          {enr.student.studentProfile?.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {enr.student.studentProfile.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          enr.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {enr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setRosterCourse(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
