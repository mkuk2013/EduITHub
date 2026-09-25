"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { upsertCourse, saveCourseModules } from "@/server/actions/admin";
import { ROUTES } from "@/lib/constants";

export interface CourseFormModule {
  id?: string;
  title: string;
  description: string;
}

export interface CourseFormInitial {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail: string | null;
  monthlyFee: number;
  duration: string;
  mode: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  requirements: string[];
  benefits: string[];
  instructorIds: string[];
  modules: CourseFormModule[];
}

interface InstructorOption {
  id: string;
  name: string;
  experience: string | null;
}

interface CourseFormProps {
  initial: CourseFormInitial | null;
  instructors: InstructorOption[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CourseForm({ initial, instructors }: CourseFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(initial?.instructorIds ?? []);
  const [modules, setModules] = useState<CourseFormModule[]>(initial?.modules ?? []);
  const [thumbnailName, setThumbnailName] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const isEdit = Boolean(initial?.id);

  function onTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleInstructor(id: string) {
    setSelectedInstructors((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  }

  function addModule() {
    setModules((prev) => [...prev, { title: "", description: "" }]);
  }

  function updateModule(index: number, patch: Partial<CourseFormModule>) {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function removeModule(index: number) {
    setModules((prev) => prev.filter((_, i) => i !== index));
  }

  function moveModule(index: number, direction: -1 | 1) {
    setModules((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const moduleErrors = useMemo(() => {
    const errors: string[] = [];
    modules.forEach((m, i) => {
      if (!m.title.trim()) errors.push(`Module ${i + 1}: title is required`);
    });
    return errors;
  }, [modules]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (moduleErrors.length > 0) {
      toast.error(moduleErrors[0]);
      return;
    }
    setBusy(true);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      // Arrays the server parses from textareas / JSON.
      formData.set("requirements", (formData.get("requirements") as string) ?? "");
      formData.set("benefits", (formData.get("benefits") as string) ?? "");
      formData.delete("instructorIds");
      for (const id of selectedInstructors) formData.append("instructorIds", id);
      formData.set("title", title);
      formData.set("slug", slug);

      const result = await upsertCourse(formData);
      if (!result.ok || !result.id) {
        toast.error(result.error ?? "Could not save the course");
        return;
      }

      const modulesResult = await saveCourseModules(
        result.id,
        modules.map((m) => ({ id: m.id, title: m.title.trim(), description: m.description.trim() })),
      );
      if (!modulesResult.ok) {
        toast.error(`Course saved, but modules failed: ${modulesResult.error}`);
        return;
      }

      toast.success(isEdit ? "Course updated" : "Course created");
      router.push(ROUTES.adminCourses);
      router.refresh();
    } catch {
      toast.error("Something went wrong — please try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Course title</Label>
              <Input id="title" name="title" value={title} onChange={(e) => onTitleChange(e.target.value)} required minLength={3} maxLength={200} placeholder="e.g. Web Development Bootcamp" />
            </div>
            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                required
                maxLength={200}
                placeholder="web-development-bootcamp"
              />
              <p className="mt-1 text-xs text-slate-500">Auto-generated from the title; you can edit it.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" name="shortDescription" defaultValue={initial?.shortDescription ?? ""} required minLength={10} maxLength={500} rows={2} placeholder="One or two sentences shown on the course card." />
          </div>

          <div>
            <Label htmlFor="description">Full description</Label>
            <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} required minLength={20} rows={6} placeholder="Detailed course description, outcomes, audience…" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="monthlyFee">Monthly fee (PKR)</Label>
              <Input id="monthlyFee" name="monthlyFee" type="number" min={0} step={1} defaultValue={initial?.monthlyFee ?? 1000} required />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" defaultValue={initial?.duration ?? ""} required maxLength={50} placeholder="e.g. 3 Months" />
            </div>
            <div>
              <Label htmlFor="mode">Mode</Label>
              <Input id="mode" name="mode" defaultValue={initial?.mode ?? "Online"} required maxLength={50} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={initial?.status ?? "DRAFT"}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="thumbnail">Thumbnail image</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setThumbnailName(e.target.files?.[0]?.name ?? "")}
            />
            <p className="mt-1 text-xs text-slate-500">
              {thumbnailName ? `Selected: ${thumbnailName}` : initial?.thumbnail ? `Current: ${initial.thumbnail}` : "JPG, PNG, WEBP or GIF. Leave empty to keep the current thumbnail."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructors</CardTitle>
        </CardHeader>
        <CardContent>
          {instructors.length === 0 ? (
            <p className="text-sm text-slate-500">No instructors found. Instructors are managed separately.</p>
          ) : (
            <fieldset>
              <legend className="sr-only">Select instructors</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {instructors.map((ins) => (
                  <label key={ins.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 hover:border-indigo-300">
                    <input
                      type="checkbox"
                      checked={selectedInstructors.includes(ins.id)}
                      onChange={() => toggleInstructor(ins.id)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-700 focus:ring-indigo-600"
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{ins.name}</span>
                      {ins.experience ? <span className="block text-xs text-slate-500">{ins.experience}</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="requirements" className="sr-only">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              name="requirements"
              defaultValue={(initial?.requirements ?? []).join("\n")}
              rows={6}
              placeholder={"One requirement per line, e.g.\nBasic computer skills\nA laptop with internet access"}
            />
            <p className="mt-1 text-xs text-slate-500">One requirement per line.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>What students will gain</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="benefits" className="sr-only">Benefits (one per line)</Label>
            <Textarea
              id="benefits"
              name="benefits"
              defaultValue={(initial?.benefits ?? []).join("\n")}
              rows={6}
              placeholder={"One benefit per line, e.g.\nBuild real-world projects\nCertificate on completion"}
            />
            <p className="mt-1 text-xs text-slate-500">One benefit per line.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Syllabus modules</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addModule}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add module
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {modules.length === 0 ? (
            <p className="text-sm text-slate-500">No modules yet. Add the syllabus modules in teaching order.</p>
          ) : (
            modules.map((m, i) => (
              <div key={m.id ?? `new-${i}`} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Module {i + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveModule(i, -1)} disabled={i === 0} aria-label={`Move module ${i + 1} up`} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => moveModule(i, 1)} disabled={i === modules.length - 1} aria-label={`Move module ${i + 1} down`} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      <ArrowDown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => removeModule(i)} aria-label={`Remove module ${i + 1}`} className="rounded p-1 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <Label htmlFor={`module-title-${i}`} className="sr-only">Module {i + 1} title</Label>
                <Input
                  id={`module-title-${i}`}
                  value={m.title}
                  onChange={(e) => updateModule(i, { title: e.target.value })}
                  placeholder="Module title"
                  className="mb-2"
                />
                <Label htmlFor={`module-desc-${i}`} className="sr-only">Module {i + 1} description</Label>
                <Textarea
                  id={`module-desc-${i}`}
                  value={m.description}
                  onChange={(e) => updateModule(i, { description: e.target.value })}
                  placeholder="What this module covers (optional)"
                  rows={2}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push(ROUTES.adminCourses)} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Save changes" : "Create course"}
        </Button>
      </div>
    </form>
  );
}
