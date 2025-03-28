"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
  RadialBarChart,
  RadialBar,
} from "recharts";
import { loadTasks } from "@/lib/taskStorage";
import { Task, TaskStatus, TaskPriority } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AnalyticsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);
  }, []);

  // Filter tasks for selected date
  const dateTasksOnly = tasks.filter((task) => {
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

  // Calculate task distribution for selected date
  const taskDistribution = {
    done: dateTasksOnly.filter((task) => task.status === TaskStatus.DONE)
      .length,
    inProgress: dateTasksOnly.filter(
      (task) => task.status === TaskStatus.IN_PROGRESS
    ).length,
    untouched: dateTasksOnly.filter(
      (task) => task.status === TaskStatus.UNTOUCHED
    ).length,
  };

  const taskDistributionData = [
    { name: "Done", value: taskDistribution.done },
    { name: "In Progress", value: taskDistribution.inProgress },
    { name: "Untouched", value: taskDistribution.untouched },
  ];

  // Calculate success rate for selected date
  const successRate =
    dateTasksOnly.length > 0
      ? ((taskDistribution.done / dateTasksOnly.length) * 100).toFixed(1)
      : 0;

  // Calculate time-based analytics for selected date
  const timeAnalytics = {
    totalEstimatedTime: dateTasksOnly.reduce((acc, task) => {
      const hours = task.estimatedHours || 0;
      const minutes = task.estimatedMinutes || 0;
      return acc + hours * 60 + minutes;
    }, 0),
    completedTasksTime: dateTasksOnly
      .filter((task) => task.status === TaskStatus.DONE)
      .reduce((acc, task) => {
        const hours = task.estimatedHours || 0;
        const minutes = task.estimatedMinutes || 0;
        return acc + hours * 60 + minutes;
      }, 0),
    inProgressTime: dateTasksOnly
      .filter((task) => task.status === TaskStatus.IN_PROGRESS)
      .reduce((acc, task) => {
        const hours = task.estimatedHours || 0;
        const minutes = task.estimatedMinutes || 0;
        return acc + hours * 60 + minutes;
      }, 0),
  };

  // Calculate priority distribution for selected date
  const priorityDistribution = {
    high: dateTasksOnly.filter((task) => task.priority === TaskPriority.HIGH)
      .length,
    medium: dateTasksOnly.filter(
      (task) => task.priority === TaskPriority.MEDIUM
    ).length,
    low: dateTasksOnly.filter((task) => task.priority === TaskPriority.LOW)
      .length,
    none: dateTasksOnly.filter((task) => !task.priority).length,
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

  // Inside the AnalyticsPage component, add this data preparation:
  const timeAnalyticsData = [
    {
      name: "Time Distribution",
      completed: timeAnalytics.completedTasksTime,
      inProgress: timeAnalytics.inProgressTime,
      remaining:
        timeAnalytics.totalEstimatedTime -
        (timeAnalytics.completedTasksTime + timeAnalytics.inProgressTime),
    },
  ];

  // Inside the AnalyticsPage component, prepare the data:
  const timeAnalyticsRadialData = [
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

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {dateTasksOnly.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No tasks found for {format(date, "MMMM d, yyyy")}
        </Card>
      ) : (
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
                ({taskDistribution.done} out of {dateTasksOnly.length} tasks)
              </div>
            </div>
          </Card>

          {/* Time Analytics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Time Analytics</h2>
            <div className="space-y-6">
              {/* Radial Bar Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    data={timeAnalyticsRadialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      minAngle={15}
                      background
                      dataKey="value"
                      label={{
                        position: "insideStart",
                        fill: "#fff",
                        formatter: (value: number) =>
                          `${Math.floor(value / 60)}h ${value % 60}m`,
                      }}
                    />
                    <Legend
                      iconSize={10}
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${Math.floor(value / 60)}h ${value % 60}m`,
                        "Time",
                      ]}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Time Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Estimated Time
                  </div>
                  <div className="text-xl font-semibold">
                    {Math.floor(timeAnalytics.totalEstimatedTime / 60)}h{" "}
                    {timeAnalytics.totalEstimatedTime % 60}m
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Completed Tasks Time
                  </div>
                  <div className="text-xl font-semibold text-green-500">
                    {Math.floor(timeAnalytics.completedTasksTime / 60)}h{" "}
                    {timeAnalytics.completedTasksTime % 60}m
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    In Progress Time
                  </div>
                  <div className="text-xl font-semibold text-blue-500">
                    {Math.floor(timeAnalytics.inProgressTime / 60)}h{" "}
                    {timeAnalytics.inProgressTime % 60}m
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Priority Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Priority Distribution
            </h2>
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
      )}
    </div>
  );
}
