"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, ExternalLink } from "lucide-react";

interface JobApplication {
  id: string;
  companyName: string;
  status: "Rejected" | "Ongoing" | "No Response" | "Accepted";
  jobSummary: string;
  applyDate: string;
  source: "Facebook" | "LinkedIn" | "Reference";
}

const dummyApplications: JobApplication[] = [
  {
    id: "1",
    companyName: "Google",
    status: "Ongoing",
    jobSummary:
      "Senior Full Stack Developer position focusing on building scalable web applications using React, Node.js, and cloud technologies. The role involves working with distributed teams and implementing best practices.",
    applyDate: "2024-03-15",
    source: "LinkedIn",
  },
  {
    id: "2",
    companyName: "Microsoft",
    status: "No Response",
    jobSummary:
      "Software Engineer role working on Azure cloud services. Position requires strong knowledge of cloud architecture, distributed systems, and experience with microservices.",
    applyDate: "2024-03-10",
    source: "Reference",
  },
  {
    id: "3",
    companyName: "Meta",
    status: "Rejected",
    jobSummary:
      "Frontend Engineer position for Facebook's new product team. The role focuses on building responsive and accessible web interfaces using React and modern web technologies.",
    applyDate: "2024-03-05",
    source: "Facebook",
  },
  {
    id: "4",
    companyName: "Amazon",
    status: "Accepted",
    jobSummary:
      "Full Stack Developer position for AWS team. Working on cloud infrastructure and developer tools, requiring expertise in both frontend and backend technologies.",
    applyDate: "2024-03-01",
    source: "LinkedIn",
  },
];

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

export default function JobHuntPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const savedApplications = localStorage.getItem("jobApplications");
    if (savedApplications) {
      setApplications(JSON.parse(savedApplications));
    } else {
      setApplications(dummyApplications);
      localStorage.setItem(
        "jobApplications",
        JSON.stringify(dummyApplications)
      );
    }
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your job applications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((job) => (
          <Card
            key={job.id}
            className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-${
              job.status === "Accepted"
                ? "green"
                : job.status === "Rejected"
                ? "red"
                : job.status === "Ongoing"
                ? "blue"
                : "yellow"
            }-500/10`}
          >
            <CardHeader className="bg-slate-50/50 dark:bg-slate-950/50 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {job.companyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Applied on {format(new Date(job.applyDate), "PPP")}
                      </span>
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {job.jobSummary}
              </p>
              <div className="flex gap-2">
                <Badge variant="outline" className={getSourceColor(job.source)}>
                  {job.source}
                </Badge>
                <Badge variant="outline" className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
