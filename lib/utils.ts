import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export enum TaskStatus {
  UNTOUCHED = "Untouched",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
}

export enum TaskPriority {
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export interface Task {
  id: string;
  featureName: string;
  description: string;
  status: TaskStatus;
  date: string;
  createdAt: string;
  startedAt?: string;
  priority?: TaskPriority;
  estimatedHours?: number;
  estimatedMinutes?: number;
  order?: number;
}
