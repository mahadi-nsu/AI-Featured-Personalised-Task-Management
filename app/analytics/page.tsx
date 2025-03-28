"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { loadTasks } from "@/lib/taskStorage";
import { Task, TaskStatus, TaskPriority } from "@/lib/utils";

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
  }, []);

  // Calculate task distribution
  const taskDistribution = {
    done: tasks.filter((task) => task.status === TaskStatus.DONE).length,
    inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS)
      .length,
    untouched: tasks.filter((task) => task.status === TaskStatus.UNTOUCHED)
      .length,
  };

  const taskDistributionData = [
    { name: "Done", value: taskDistribution.done },
    { name: "In Progress", value: taskDistribution.inProgress },
    { name: "Untouched", value: taskDistribution.untouched },
  ];

  // Calculate success rate
  const successRate =
    tasks.length > 0
      ? ((taskDistribution.done / tasks.length) * 100).toFixed(1)
      : 0;

  // Calculate time-based analytics
  const timeAnalytics = {
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
  };

  // Calculate priority distribution
  const priorityDistribution = {
    high: tasks.filter((task) => task.priority === TaskPriority.HIGH).length,
    medium: tasks.filter((task) => task.priority === TaskPriority.MEDIUM)
      .length,
    low: tasks.filter((task) => task.priority === TaskPriority.LOW).length,
    none: tasks.filter((task) => !task.priority).length,
  };

  const priorityData = [
    { name: "High", value: priorityDistribution.high },
    { name: "Medium", value: priorityDistribution.medium },
    { name: "Low", value: priorityDistribution.low },
    { name: "No Priority", value: priorityDistribution.none },
  ];

  // Colors for charts
  const COLORS = {
    done: "#22c55e",
    inProgress: "#3b82f6",
    untouched: "#6b7280",
    high: "#ef4444",
    medium: "#eab308",
    low: "#22c55e",
    none: "#6b7280",
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {taskDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Done"
                          ? COLORS.done
                          : entry.name === "In Progress"
                          ? COLORS.inProgress
                          : COLORS.untouched
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-5xl font-bold text-green-500">
              {successRate}%
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Tasks Completed
            </div>
            <div className="text-sm text-muted-foreground">
              ({taskDistribution.done} out of {tasks.length} tasks)
            </div>
          </div>
        </Card>

        {/* Time Analytics */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Time Analytics</h2>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Total Estimated Time
              </div>
              <div className="text-2xl font-semibold">
                {Math.floor(timeAnalytics.totalEstimatedTime / 60)}h{" "}
                {timeAnalytics.totalEstimatedTime % 60}m
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Completed Tasks Time
              </div>
              <div className="text-2xl font-semibold text-green-500">
                {Math.floor(timeAnalytics.completedTasksTime / 60)}h{" "}
                {timeAnalytics.completedTasksTime % 60}m
              </div>
            </div>
          </div>
        </Card>

        {/* Priority Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Priority Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "High"
                          ? COLORS.high
                          : entry.name === "Medium"
                          ? COLORS.medium
                          : entry.name === "Low"
                          ? COLORS.low
                          : COLORS.none
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
