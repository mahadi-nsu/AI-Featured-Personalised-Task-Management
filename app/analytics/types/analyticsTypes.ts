import { Task, TaskStatus, TaskPriority } from "@/lib/utils";

export interface TaskDistribution {
  done: number;
  inProgress: number;
  untouched: number;
}

export interface TimeAnalytics {
  totalEstimatedTime: number;
  completedTasksTime: number;
  inProgressTime: number;
}

export interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
  none: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TimeAnalyticsData {
  name: string;
  completed: number;
  inProgress: number;
  remaining: number;
}

export interface TimeAnalyticsRadialData {
  name: string;
  value: number;
  fill: string;
}

export interface AnalyticsColors {
  done: string;
  inProgress: string;
  untouched: string;
  high: string;
  medium: string;
  low: string;
  none: string;
}

export interface AnalyticsData {
  tasks: Task[];
  dateTasksOnly: Task[];
  taskDistribution: TaskDistribution;
  timeAnalytics: TimeAnalytics;
  priorityDistribution: PriorityDistribution;
  successRate: string;
}
