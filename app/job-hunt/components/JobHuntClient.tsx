"use client";

import { useState } from "react";
import JobList from "./JobList";
import AddJobButton from "./AddJobButton";
import { JobApplication } from "./JobList";
import { toast } from "sonner";

interface JobHuntClientProps {
  initialApplications: JobApplication[];
}

export default function JobHuntClient({
  initialApplications,
}: JobHuntClientProps) {
  const [applications, setApplications] =
    useState<JobApplication[]>(initialApplications);

  const handleJobAdded = (
    newJob: JobApplication | undefined,
    success: boolean
  ) => {
    if (success && newJob) {
      // Create a new array reference
      const updatedApplications = [newJob, ...applications];
      setApplications(updatedApplications);
    } else {
      toast.error("Failed to add job. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Job Applications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
        <AddJobButton
          onJobAdded={handleJobAdded}
          applications={applications}
          setApplications={setApplications}
        />
      </div>

      <JobList initialApplications={applications} />
    </div>
  );
}
