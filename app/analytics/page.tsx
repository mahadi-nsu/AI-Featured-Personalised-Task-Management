"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarIcon } from "lucide-react";
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
import { fetchTasks } from "@/lib/taskStorage";
import { Task, TaskStatus, TaskPriority } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTasks = async () => {
      setIsLoading(true);
      try {
        const loadedTasks = await fetchTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Could not load tasks for analytics.");
      } finally {
        setIsLoading(false);
      }
    };
    getTasks();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie Chart (existing) */}
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

              {/* Task Statistics */}
              <div className="space-y-6">
                {/* Total Tasks */}
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">
                    Total Tasks
                  </div>
                  <div className="text-2xl font-semibold">
                    {dateTasksOnly.length}
                  </div>
                </div>

                {/* Status Breakdown */}
                <div className="space-y-3">
                  {/* Done Tasks */}
                  <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Done</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (taskDistribution.done / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-500">
                      {taskDistribution.done}
                    </div>
                  </div>

                  {/* In Progress Tasks */}
                  <div className="flex items-center justify-between border-l-2 border-blue-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (taskDistribution.inProgress / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-blue-500">
                      {taskDistribution.inProgress}
                    </div>
                  </div>

                  {/* Untouched Tasks */}
                  <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Untouched</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (taskDistribution.untouched / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-500">
                      {taskDistribution.untouched}
                    </div>
                  </div>
                </div>

                {/* Task Completion Rate */}
                <div className="pt-4 mt-4 border-t">
                  <div className="text-sm font-medium mb-3">
                    Task Completion Rate
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                    <div className="text-2xl font-semibold text-green-500">
                      {(
                        (taskDistribution.done / dateTasksOnly.length) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {taskDistribution.done} of {dateTasksOnly.length} tasks
                      completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Success Rate */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Circular Progress Chart */}
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: taskDistribution.done },
                        {
                          name: "Remaining",
                          value: dateTasksOnly.length - taskDistribution.done,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                    >
                      <Cell fill={COLORS.done} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} task${value !== 1 ? "s" : ""}`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Success Rate Statistics */}
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                  <div className="text-4xl font-bold text-green-500">
                    {successRate}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Completion Rate
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Completed Tasks</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (taskDistribution.done / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-500">
                      {taskDistribution.done}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Remaining Tasks</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          ((dateTasksOnly.length - taskDistribution.done) /
                            dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-500">
                      {dateTasksOnly.length - taskDistribution.done}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="text-sm text-muted-foreground">
                    Total Tasks: {dateTasksOnly.length}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Analytics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Time Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Radial Bar Chart */}
              <div className="h-[300px] flex flex-col">
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
                    <RadialBar background dataKey="value" label={false} />
                    <Tooltip
                      formatter={(value: number) => [
                        `${Math.floor(value / 60)}h ${value % 60}m`,
                        "Time",
                      ]}
                      contentStyle={{
                        backgroundColor: "#FDF6E9",
                        border: "1px solid #E6D5B8",
                        color: "#8B4513",
                        borderRadius: "var(--radius)",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{
                        color: "#8B4513",
                        fontWeight: 500,
                      }}
                    />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {/* Time Statistics */}
              <div className="space-y-6">
                {/* Total Time */}
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground">
                    Total Estimated Time
                  </div>
                  <div className="text-2xl font-semibold">
                    {Math.floor(timeAnalytics.totalEstimatedTime / 60)}h{" "}
                    {timeAnalytics.totalEstimatedTime % 60}m
                  </div>
                </div>

                {/* Time Breakdown */}
                <div className="space-y-3">
                  {/* Completed Time */}
                  <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Completed</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (timeAnalytics.completedTasksTime /
                            timeAnalytics.totalEstimatedTime) *
                          100
                        ).toFixed(1)}
                        % of total time
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-500">
                      {Math.floor(timeAnalytics.completedTasksTime / 60)}h{" "}
                      {timeAnalytics.completedTasksTime % 60}m
                    </div>
                  </div>

                  {/* In Progress Time */}
                  <div className="flex items-center justify-between border-l-2 border-blue-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">In Progress</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (timeAnalytics.inProgressTime /
                            timeAnalytics.totalEstimatedTime) *
                          100
                        ).toFixed(1)}
                        % of total time
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-blue-500">
                      {Math.floor(timeAnalytics.inProgressTime / 60)}h{" "}
                      {timeAnalytics.inProgressTime % 60}m
                    </div>
                  </div>

                  {/* Remaining Time */}
                  <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Remaining</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          ((timeAnalytics.totalEstimatedTime -
                            (timeAnalytics.completedTasksTime +
                              timeAnalytics.inProgressTime)) /
                            timeAnalytics.totalEstimatedTime) *
                          100
                        ).toFixed(1)}
                        % of total time
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-500">
                      {Math.floor(
                        (timeAnalytics.totalEstimatedTime -
                          (timeAnalytics.completedTasksTime +
                            timeAnalytics.inProgressTime)) /
                          60
                      )}
                      h{" "}
                      {(timeAnalytics.totalEstimatedTime -
                        (timeAnalytics.completedTasksTime +
                          timeAnalytics.inProgressTime)) %
                        60}
                      m
                    </div>
                  </div>
                </div>

                {/* Time Completion Rate */}
                <div className="pt-4 mt-4 border-t">
                  <div className="text-sm font-medium mb-3">
                    Time Completion Rate
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
                    <div className="text-2xl font-semibold text-green-500">
                      {(
                        (timeAnalytics.completedTasksTime /
                          timeAnalytics.totalEstimatedTime) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.floor(timeAnalytics.completedTasksTime / 60)}h{" "}
                      {timeAnalytics.completedTasksTime % 60}m of{" "}
                      {Math.floor(timeAnalytics.totalEstimatedTime / 60)}h{" "}
                      {timeAnalytics.totalEstimatedTime % 60}m completed
                    </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6">
              {/* Bar Chart */}
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} task${value !== 1 ? "s" : ""}`,
                        `${props.payload.name} Priority`,
                      ]}
                      contentStyle={{
                        backgroundColor: "#FDF6E9",
                        border: "1px solid #E6D5B8",
                        color: "#8B4513",
                        borderRadius: "var(--radius)",
                        boxShadow:
                          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{
                        color: "#8B4513",
                        fontWeight: 500,
                      }}
                    />
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

              {/* Priority Statistics */}
              <div className="space-y-4">
                {/* Total Tasks */}
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground">
                    Tasks with Priority
                  </div>
                  <div className="text-2xl font-semibold">
                    {dateTasksOnly.length - priorityDistribution.none}
                    <span className="text-sm text-muted-foreground ml-2">
                      (
                      {(
                        ((dateTasksOnly.length - priorityDistribution.none) /
                          dateTasksOnly.length) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>

                {/* Priority Breakdown */}
                <div className="space-y-3">
                  {/* High Priority */}
                  <div className="flex items-center justify-between border-l-2 border-red-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">High Priority</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (priorityDistribution.high / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-red-500">
                      {priorityDistribution.high}
                    </div>
                  </div>

                  {/* Medium Priority */}
                  <div className="flex items-center justify-between border-l-2 border-yellow-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Medium Priority</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (priorityDistribution.medium / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-yellow-500">
                      {priorityDistribution.medium}
                    </div>
                  </div>

                  {/* Low Priority */}
                  <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">Low Priority</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (priorityDistribution.low / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-green-500">
                      {priorityDistribution.low}
                    </div>
                  </div>

                  {/* No Priority */}
                  <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
                    <div>
                      <div className="text-sm font-medium">No Priority</div>
                      <div className="text-xs text-muted-foreground">
                        {(
                          (priorityDistribution.none / dateTasksOnly.length) *
                          100
                        ).toFixed(1)}
                        % of total
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-gray-500">
                      {priorityDistribution.none}
                    </div>
                  </div>
                </div>

                {/* Completion by Priority */}
                <div className="pt-4 mt-4 border-t">
                  <div className="text-sm font-medium mb-3">
                    Completion Rate
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
                      <div className="text-red-600 dark:text-red-400 font-medium">
                        High
                      </div>
                      <div>
                        {(
                          (dateTasksOnly.filter(
                            (t) =>
                              t.priority === TaskPriority.HIGH &&
                              t.status === TaskStatus.DONE
                          ).length /
                            (priorityDistribution.high || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-md">
                      <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                        Medium
                      </div>
                      <div>
                        {(
                          (dateTasksOnly.filter(
                            (t) =>
                              t.priority === TaskPriority.MEDIUM &&
                              t.status === TaskStatus.DONE
                          ).length /
                            (priorityDistribution.medium || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        Low
                      </div>
                      <div>
                        {(
                          (dateTasksOnly.filter(
                            (t) =>
                              t.priority === TaskPriority.LOW &&
                              t.status === TaskStatus.DONE
                          ).length /
                            (priorityDistribution.low || 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
