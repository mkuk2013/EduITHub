"use client";

import { useState, useTransition } from "react";
import {
  UserCheck,
  Plus,
  Mail,
  Phone,
  BookOpen,
  Edit2,
  Trash2,
  Video,
  VideoOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import {
  createInstructorAction,
  updateInstructorAction,
  deleteInstructorAction,
} from "@/server/actions/admin-instructors";

interface CourseItem {
  id: string;
  title: string;
  slug?: string;
  status?: string;
}

interface InstructorItem {
  id: string;
  userId?: string | null;
  name: string;
  email?: string | null;
  bio?: string | null;
  experience?: string | null;
  contact?: string | null;
  user?: {
    id: string;
    email: string;
    status: string;
  } | null;
  courses: Array<{
    course: CourseItem;
  }>;
  schedules: Array<{
    id: string;
    courseId: string;
    meetingUrl?: string | null;
  }>;
}

interface InstructorManagementProps {
  instructors: InstructorItem[];
  allCourses: CourseItem[];
}

export function InstructorManagement({
  instructors,
  allCourses,
}: InstructorManagementProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [experience, setExperience] = useState("");
  const [contact, setContact] = useState("");
  const [bio, setBio] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  function openCreateModal() {
    setEditingInstructor(null);
    setName("");
    setEmail("");
    setPassword("");
    setExperience("Qualified IT Instructor");
    setContact("");
    setBio("");
    setSelectedCourses([]);
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  }

  function openEditModal(inst: InstructorItem) {
    setEditingInstructor(inst);
    setName(inst.name);
    setEmail(inst.email || inst.user?.email || "");
    setPassword(""); // Leave empty unless updating password
    setExperience(inst.experience || "");
    setContact(inst.contact || "");
    setBio(inst.bio || "");
    setSelectedCourses(inst.courses.map((c) => c.course.id));
    setErrorMsg(null);
    setSuccessMsg(null);
    setModalOpen(true);
  }

  function handleCourseToggle(courseId: string) {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      if (editingInstructor) {
        const res = await updateInstructorAction({
          id: editingInstructor.id,
          name,
          email,
          password: password.trim() ? password.trim() : undefined,
          experience,
          contact,
          bio,
          courseIds: selectedCourses,
        });

        if (!res.ok) {
          setErrorMsg(res.error || "Failed to update instructor");
        } else {
          setSuccessMsg("Instructor updated successfully!");
          setTimeout(() => setModalOpen(false), 1000);
        }
      } else {
        if (!password.trim() || password.length < 6) {
          setErrorMsg("Password is required and must be at least 6 characters");
          return;
        }

        const res = await createInstructorAction({
          name,
          email,
          password,
          experience,
          contact,
          bio,
          courseIds: selectedCourses,
        });

        if (!res.ok) {
          setErrorMsg(res.error || "Failed to create instructor");
        } else {
          setSuccessMsg("Instructor account created successfully!");
          setTimeout(() => setModalOpen(false), 1000);
        }
      }
    });
  }

  function handleDelete(id: string, instName: string) {
    if (
      !confirm(
        `Are you sure you want to remove ${instName}? Their instructor access will be revoked.`
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteInstructorAction(id);
      if (!res.ok) {
        alert(res.error || "Failed to delete instructor");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Banner and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-cyan-400/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-white">
            Instructors & Course Faculty
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl">
            Add instructors, assign their courses, and allow them to manage live
            Google Meet class links for their enrolled students.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-5 py-3 text-xs sm:text-sm transition-all shadow-md font-heading cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Instructor</span>
        </button>
      </div>

      {/* Instructors Table */}
      {instructors.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            No instructors added yet
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click &ldquo;Add New Instructor&rdquo; to create instructor login credentials and
            assign courses.
          </p>
          <Button onClick={openCreateModal} className="mt-4" size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add First Instructor
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <Table>
            <THead>
              <TR>
                <TH>Instructor</TH>
                <TH>Login Email</TH>
                <TH>Assigned Courses</TH>
                <TH>Live Meet Status</TH>
                <TH>Contact</TH>
                <TH className="text-right">Actions</TH>
              </TR>
            </THead>
            <TBody>
              {instructors.map((inst) => {
                const assignedCount = inst.courses.length;
                const meetConfiguredCount = inst.schedules.filter(
                  (s) => s.meetingUrl && s.meetingUrl.trim().length > 0
                ).length;

                return (
                  <TR key={inst.id}>
                    {/* Instructor Info */}
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                          {inst.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {inst.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {inst.experience || "Instructor"}
                          </p>
                        </div>
                      </div>
                    </TD>

                    {/* Login Email */}
                    <TD>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">
                          {inst.email || inst.user?.email || "No email"}
                        </span>
                      </div>
                    </TD>

                    {/* Assigned Courses */}
                    <TD>
                      {assignedCount === 0 ? (
                        <span className="text-xs text-slate-400 italic">
                          No courses assigned
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {inst.courses.map(({ course }) => (
                            <span
                              key={course.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200"
                            >
                              <BookOpen className="w-2.5 h-2.5 text-indigo-600 shrink-0" />
                              <span className="truncate max-w-[140px]">
                                {course.title}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </TD>

                    {/* Live Meet Status */}
                    <TD>
                      {meetConfiguredCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <Video className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {meetConfiguredCount} Active Link
                            {meetConfiguredCount > 1 ? "s" : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Not configured</span>
                        </span>
                      )}
                    </TD>

                    {/* Contact */}
                    <TD>
                      {inst.contact ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inst.contact}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TD>

                    {/* Actions */}
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(inst)}
                          className="h-8 px-2.5 text-xs font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(inst.id, inst.name)}
                          className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}

      {/* Add / Edit Instructor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 font-heading text-base">
                  {editingInstructor
                    ? `Edit Instructor: ${editingInstructor.name}`
                    : "Add New Instructor"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mukesh Kumar"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                {/* Login Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Login Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="instructor@eduithub.academy"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>
                    Account Password{" "}
                    {!editingInstructor && (
                      <span className="text-rose-500">*</span>
                    )}
                  </span>
                  {editingInstructor && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      Leave blank to keep existing password
                    </span>
                  )}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required={!editingInstructor}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      editingInstructor
                        ? "Enter new password (optional)"
                        : "Create strong password (min 6 characters)"
                    }
                    className="w-full h-10 rounded-xl border border-slate-200 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Experience / Designation
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Mentor (5+ Yrs)"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Contact / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="03363268833"
                    className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-900 font-mono focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Biography & Background
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Short teacher introduction for students..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Assign Courses */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Assign Courses to Instructor</span>
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600">
                    {selectedCourses.length} Selected
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-50 border border-slate-200">
                  {allCourses.map((c) => {
                    const isChecked = selectedCourses.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-start gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-indigo-50/80 border border-indigo-200 text-indigo-950 font-semibold"
                            : "hover:bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCourseToggle(c.id)}
                          className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="leading-tight">{c.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
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
                  {isPending
                    ? "Saving..."
                    : editingInstructor
                    ? "Update Instructor"
                    : "Create Instructor Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
