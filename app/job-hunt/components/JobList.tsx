"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  ExternalLink,
  Upload,
  Check,
  Clock,
  HourglassIcon,
  XCircle,
  Pencil,
  Trash2,
  MapPin,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle?: string;
  jobSummary: string;
  applyDate: string;
  status: string;
  source: string;
  location?: string;
  jobPostUrl: string;
  deadline?: string;
  resume?: string;
  newResumeFile?: File;
}

interface JobListProps {
  initialApplications: JobApplication[];
}

const getCardStatusStyle = (status: JobApplication["status"]) => {
  switch (status) {
    case "Accepted":
      return "bg-green-500/5 dark:bg-green-500/10 hover:bg-green-500/10 dark:hover:bg-green-500/15 border-green-500/20";
    case "Rejected":
      return "bg-red-500/5 dark:bg-red-500/10 hover:bg-red-500/10 dark:hover:bg-red-500/15 border-red-500/20";
    case "Ongoing":
      return "bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/15 border-blue-500/20";
    case "No Response":
      return "bg-yellow-500/5 dark:bg-yellow-500/10 hover:bg-yellow-500/10 dark:hover:bg-yellow-500/15 border-yellow-500/20";
    default:
      return "border-slate-200/50 dark:border-slate-800/50";
  }
};

const getTrackerPosition = (status: JobApplication["status"]) => {
  switch (status) {
    case "No Response":
      return "left-[5%]";
    case "Ongoing":
      return "left-1/2 -translate-x-1/2";
    case "Accepted":
      return "right-[5%]";
    default:
      return "hidden";
  }
};

const getStatusColor = (status: JobApplication["status"]) => {
  switch (status) {
    case "Accepted":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "Rejected":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "Ongoing":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "No Response":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
  }
};

const getSourceColor = (source: JobApplication["source"]) => {
  switch (source) {
    case "LinkedIn":
      return "bg-[#0A66C2]/10 text-[#0A66C2] dark:text-[#0A66C2] border-[#0A66C2]/20";
    case "Facebook":
      return "bg-[#1877F2]/10 text-[#1877F2] dark:text-[#1877F2] border-[#1877F2]/20";
    case "Reference":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
  }
};

const getTrackerInfo = (currentStatus: JobApplication["status"]) => {
  const steps = [
    {
      status: "No Response",
      label: "Applied",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
    },
    {
      status: "Ongoing",
      label: "In Progress",
      icon: HourglassIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
    },
    {
      status: "Accepted",
      label: "Accepted",
      icon: Check,
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
  ];

  // Find the current step index
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);

  return {
    steps,
    currentIndex: currentIndex === -1 ? null : currentIndex, // null if rejected
  };
};

// Add keyframes for the slower pulse effect
const slowPulseKeyframes = `
@keyframes slow-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}
`;

// Style tag to inject keyframes
const StyleTag = () => <style>{slowPulseKeyframes}</style>;

export default function JobList({ initialApplications }: JobListProps) {
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [deletingJob, setDeletingJob] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    setIsSubmitting(true);
    try {
      let resumeUrl = editingJob.resume;

      // Handle resume file upload if a new file is selected
      if (editingJob.newResumeFile) {
        const file = editingJob.newResumeFile;
        const fileExt = file.name.split(".").pop();
        const fileName = `${editingJob.id}-${Date.now()}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        // Upload the file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const {
          data: { publicUrl },
        } = supabase.storage.from("resumes").getPublicUrl(filePath);

        resumeUrl = publicUrl;
      }

      const { error } = await supabase
        .from("applied_jobs")
        .update({
          companyName: editingJob.companyName,
          jobTitle: editingJob.jobTitle,
          jobSummary: editingJob.jobSummary,
          status: editingJob.status,
          source: editingJob.source,
          location: editingJob.location,
          applyDate: editingJob.applyDate,
          jobPostUrl: editingJob.jobPostUrl,
          deadline: editingJob.deadline,
          resume: resumeUrl,
        })
        .eq("id", editingJob.id);

      if (error) throw error;

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update job application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingJob) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("applied_jobs")
        .delete()
        .eq("id", deletingJob.id);

      if (error) throw error;

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to delete job application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <StyleTag />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {initialApplications.map((job) => (
          <Card
            key={job.id}
            className={cn(
              "group overflow-hidden transition-all duration-300 hover:shadow-lg",
              getCardStatusStyle(job.status)
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {job.companyName}
                </CardTitle>
                {job.jobTitle && (
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-primary" />
                    <span className="text-primary">{job.jobTitle}</span>
                  </div>
                )}
                {job.location && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 p-1 rounded-md bg-slate-100/50 dark:bg-slate-800/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                  onClick={() => setEditingJob(job)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                  onClick={() => setDeletingJob(job)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                {job.resume && (
                  <a
                    href={job.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Resume"
                    className="h-8 w-8 flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors rounded hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                  >
                    <Upload className="h-4 w-4" />
                  </a>
                )}
                {job.jobPostUrl && (
                  <a
                    href={job.jobPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Job Post"
                    className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors rounded hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 relative group-hover:bg-slate-50/50 dark:group-hover:bg-slate-950/50 transition-colors">
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground line-clamp-3 group-hover:text-foreground transition-colors"
                dangerouslySetInnerHTML={{ __html: job.jobSummary || "" }}
              />
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      getSourceColor(job.source),
                      "transition-all duration-300 group-hover:border-opacity-50 text-xs px-1.5 py-0.5"
                    )}
                  >
                    {job.source}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      getStatusColor(job.status),
                      "transition-all duration-300 group-hover:border-opacity-50 text-xs px-1.5 py-0.5"
                    )}
                  >
                    {job.status}
                  </Badge>
                </div>
                {job.deadline && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Deadline: {format(new Date(job.deadline), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            {job.status !== "Rejected" ? (
              <CardFooter className="p-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="w-full space-y-3">
                  <div className="relative flex justify-between">
                    <div className="w-full flex justify-between relative">
                      {/* Progress Bar - Positioned between first and last icons */}
                      <div className="absolute top-4 left-[calc(2rem+4px)] right-[calc(2rem+4px)] h-[3px] bg-slate-200 dark:bg-slate-700 -z-0">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            getTrackerInfo(job.status).currentIndex === 0
                              ? "w-0 bg-yellow-500"
                              : getTrackerInfo(job.status).currentIndex === 1
                              ? "w-1/2 bg-gradient-to-r from-yellow-500 to-blue-500 [animation:slow-pulse_2.5s_ease-in-out_infinite]"
                              : getTrackerInfo(job.status).currentIndex === 2
                              ? "w-full bg-gradient-to-r from-yellow-500 via-blue-500 to-green-500"
                              : "w-0"
                          )}
                          style={{ transformOrigin: "center left" }}
                        />
                      </div>

                      {/* Icons and Labels */}
                      {getTrackerInfo(job.status).steps.map((step, index) => {
                        const isActive =
                          index <=
                          (getTrackerInfo(job.status).currentIndex ?? -1);
                        const isCurrent =
                          index === getTrackerInfo(job.status).currentIndex;

                        return (
                          <div
                            key={step.status}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                                isCurrent
                                  ? `bg-white dark:bg-slate-900 ring-4 ${step.bgColor}/30 shadow-lg scale-110 [animation:slow-pulse_2.5s_ease-in-out_infinite]`
                                  : "bg-slate-100 dark:bg-slate-800",
                                isActive
                                  ? `${step.color} ring-${step.bgColor}/20`
                                  : "text-slate-400"
                              )}
                            >
                              <step.icon className="w-4 h-4" />
                            </div>

                            <span
                              className={cn(
                                "mt-2 text-xs font-medium transition-colors duration-500",
                                isCurrent ? "font-bold" : "",
                                isActive ? step.color : "text-slate-400"
                              )}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardFooter>
            ) : (
              <CardFooter className="p-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="w-full flex items-center justify-center gap-2 text-red-500">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Application Rejected
                  </span>
                </div>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingJob !== null}
        onOpenChange={() => setEditingJob(null)}
      >
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Edit Job Application</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <form onSubmit={handleEdit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      placeholder="Company Name"
                      value={editingJob.companyName}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          companyName: e.target.value,
                        })
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Input
                    id="jobTitle"
                    placeholder="Job Title"
                    value={editingJob.jobTitle}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        jobTitle: e.target.value,
                      })
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <RichTextEditor
                    value={editingJob.jobSummary}
                    onChange={(value) =>
                      setEditingJob({
                        ...editingJob,
                        jobSummary: value,
                      })
                    }
                    placeholder="Job description and requirements..."
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Location"
                      value={editingJob.location}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          location: e.target.value,
                        })
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="jobPostUrl"
                      placeholder="Job Post URL"
                      value={editingJob.jobPostUrl}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          jobPostUrl: e.target.value,
                        })
                      }
                      type="url"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      placeholder="Application Deadline"
                      value={editingJob.deadline}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          deadline: e.target.value,
                        })
                      }
                      type="date"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.type !== "application/pdf") {
                            toast.error("Please upload a PDF file");
                            return;
                          }
                          setEditingJob({
                            ...editingJob,
                            newResumeFile: file,
                          });
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {editingJob.resume && (
                    <p className="text-sm text-muted-foreground">
                      Current Resume: {editingJob.resume.split("/").pop()}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editingJob.status}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          status: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <option value="Ongoing">Ongoing</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                      <option value="No Response">No Response</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">
                      Source:
                    </span>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={editingJob.source}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          source: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Reference">Reference</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingJob !== null}
        onOpenChange={() => setDeletingJob(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job
              application for {deletingJob?.companyName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
