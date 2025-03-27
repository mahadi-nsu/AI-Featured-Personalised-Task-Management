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

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  date: string;
  createdAt: string;
  order?: number; // Optional order property for sorting
};
