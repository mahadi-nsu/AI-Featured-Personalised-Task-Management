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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
            <CardHeader className="bg-gradient-to-r from-slate-50/50 to-purple-50/20 dark:from-slate-950/50 dark:to-purple-950/20 border-b dark:border-slate-800/50 relative overflow-hidden p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-start gap-3 flex-grow mr-4">
                  <div className="mt-1">
                    <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {job.companyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Applied:{" "}
                        {format(new Date(job.applyDate), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 mt-1">
                  {job.resume && (
                    <a
                      href={job.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Resume"
                      className="text-blue-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
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
                      className="text-muted-foreground hover:text-primary transition-colors p-1 rounded hover:bg-slate-200/70 dark:hover:bg-slate-700/70"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
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
    </>
  );
}
