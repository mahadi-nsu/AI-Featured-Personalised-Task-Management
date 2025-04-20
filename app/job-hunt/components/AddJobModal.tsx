"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { JobApplication } from "./JobList";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded?: (job: JobApplication | undefined, success: boolean) => void;
}

export function AddJobModal({ isOpen, onClose, onJobAdded }: AddJobModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobSummary, setJobSummary] = useState("");
  const [location, setLocation] = useState("");
  const [jobPostUrl, setJobPostUrl] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [source, setSource] = useState("LinkedIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newJob: Omit<JobApplication, "id"> = {
        companyName,
        // jobTitle,
        jobSummary,
        // location,
        jobPostUrl,
        status,
        source,
        applyDate: new Date().toISOString().split("T")[0],
      };

      const { data, error } = await supabase
        .from("applied_jobs")
        .insert([newJob])
        .select()
        .single();

      if (error) throw error;

      onJobAdded?.(data, true);
      onClose();
      toast.success("Job application added successfully!");

      // Reset form
      setCompanyName("");
      setJobTitle("");
      setJobSummary("");
      setLocation("");
      setJobPostUrl("");
      setStatus("Ongoing");
      setSource("LinkedIn");
    } catch (error) {
      console.error("Error adding job application:", error);
      toast.error("Failed to add job application");
      onJobAdded?.(undefined, false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Job Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Input
                id="jobTitle"
                placeholder="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <RichTextEditor
                value={jobSummary}
                onChange={setJobSummary}
                placeholder="Job description and requirements..."
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
                  value={jobPostUrl}
                  onChange={(e) => setJobPostUrl(e.target.value)}
                  type="url"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <select
                  className="w-full p-2 border rounded-md"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                  <option value="No Response">No Response</option>
                </select>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Source:</span>
                <select
                  className="w-full p-2 border rounded-md"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
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
                {isSubmitting ? "Adding..." : "Add Application"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
