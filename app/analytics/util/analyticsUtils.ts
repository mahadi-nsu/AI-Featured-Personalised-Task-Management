import { Task, TaskStatus, TaskPriority } from "@/lib/utils";
import {
  TaskDistribution,
  TimeAnalytics,
  PriorityDistribution,
  ChartData,
  TimeAnalyticsData,
  TimeAnalyticsRadialData,
} from "../types/analyticsTypes";
import { COLORS } from "../static/colors";

export const filterTasksByDate = (tasks: Task[], date: Date): Task[] => {
  return tasks.filter((task) => {
    if (!task.date) return false;

    try {
      const taskDate = new Date(task.date);
      const selectedDate = new Date(date);

      // Reset time part for comparison
      taskDate.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      return (
        taskDate.getDate() === selectedDate.getDate() &&
        taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear()
      );
    } catch (error) {
      console.error("Error comparing dates:", error);
      return false;
    }
  });
};

export const calculateTaskDistribution = (tasks: Task[]): TaskDistribution => {
  return {
    done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
    inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      .length,
    untouched: tasks.filter((task) => task.status === TaskStatus.UNTOUCHED)
      .length,
  };
};

export const calculateTimeAnalytics = (tasks: Task[]): TimeAnalytics => {
  return {
    totalEstimatedTime: tasks.reduce((acc, task) => {
      const hours = task.estimatedHours || 0;
      const minutes = task.estimatedMinutes || 0;
      return acc + hours * 60 + minutes;
    }, 0),
    completedTasksTime: tasks
      .filter((task) => task.status === TaskStatus.DONE)
      .reduce((acc, task) => {
        const hours = task.estimatedHours || 0;
        const minutes = task.estimatedMinutes || 0;
        return acc + hours * 60 + minutes;
      }, 0),
    inProgressTime: tasks
      .filter((task) => task.status === TaskStatus.IN_PROGRESS)
      .reduce((acc, task) => {
        const hours = task.estimatedHours || 0;
        const minutes = task.estimatedMinutes || 0;
        return acc + hours * 60 + minutes;
      }, 0),
  };
};

export const calculatePriorityDistribution = (
  tasks: Task[]
): PriorityDistribution => {
  return {
    high: tasks.filter((task) => task.priority === TaskPriority.HIGH).length,
    medium: tasks.filter((task) => task.priority === TaskPriority.MEDIUM)
      .length,
    low: tasks.filter((task) => task.priority === TaskPriority.LOW).length,
    none: tasks.filter((task) => !task.priority).length,
  };
};

export const calculateSuccessRate = (
  tasks: Task[],
  taskDistribution: TaskDistribution
): string => {
  return tasks.length > 0
    ? ((taskDistribution.done / tasks.length) * 100).toFixed(1)
    : "0";
};

export const createTaskDistributionData = (
  taskDistribution: TaskDistribution
): ChartData[] => {
  return [
    { name: "Done", value: taskDistribution.done },
    { name: "In Progress", value: taskDistribution.inProgress },
    { name: "Untouched", value: taskDistribution.untouched },
  ];
};

export const createPriorityData = (
  priorityDistribution: PriorityDistribution
): ChartData[] => {
  return [
    { name: "High", value: priorityDistribution.high },
    { name: "Medium", value: priorityDistribution.medium },
    { name: "Low", value: priorityDistribution.low },
    { name: "No Priority", value: priorityDistribution.none },
  ];
};

export const createTimeAnalyticsData = (
  timeAnalytics: TimeAnalytics
): TimeAnalyticsData[] => {
  return [
    {
      name: "Time Distribution",
      completed: timeAnalytics.completedTasksTime,
      inProgress: timeAnalytics.inProgressTime,
      remaining:
        timeAnalytics.totalEstimatedTime -
        (timeAnalytics.completedTasksTime + timeAnalytics.inProgressTime),
    },
  ];
};

export const createTimeAnalyticsRadialData = (
  timeAnalytics: TimeAnalytics
): TimeAnalyticsRadialData[] => {
  return [
    {
      name: "Remaining",
      value: timeAnalytics.totalEstimatedTime,
      fill: COLORS.untouched,
    },
    {
      name: "In Progress",
      value: timeAnalytics.completedTasksTime + timeAnalytics.inProgressTime,
      fill: COLORS.inProgress,
    },
    {
      name: "Completed",
      value: timeAnalytics.completedTasksTime,
      fill: COLORS.done,
    },
  ];
};

export const formatTime = (minutes: number): string => {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};
