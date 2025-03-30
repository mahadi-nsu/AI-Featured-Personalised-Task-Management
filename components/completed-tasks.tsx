"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/lib/utils";
import { loadTasks } from "@/lib/taskStorage";
import { Tag, Clock } from "lucide-react";

export function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks on component mount
  useEffect(() => {
    const loadedTasks = loadTasks();
    // Filter only completed tasks
    const completedTasks = loadedTasks.filter(
      (task) => task.status === TaskStatus.DONE
    );
    setTasks(completedTasks);
  }, []);

  // Get priority badge color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format estimated time display
  const getEstimatedTimeDisplay = (task: Task) => {
    if (!task.estimatedHours && !task.estimatedMinutes) return null;
    const parts = [];
    if (task.estimatedHours) parts.push(`${task.estimatedHours}h`);
    if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes}m`);
    return parts.join(" ");
  };

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <Card className="p-4">
          <p className="text-muted-foreground">No completed tasks yet.</p>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-primary line-through">
                {task.featureName}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {task.description}
              </span>
              <div className="flex flex-wrap gap-2">
                {task.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {task.priority}
                  </span>
                )}
                {getEstimatedTimeDisplay(task) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    <Clock className="h-3 w-3 mr-1" />
                    {getEstimatedTimeDisplay(task)}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
