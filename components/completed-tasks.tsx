"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/lib/utils";
import { loadTasks } from "@/lib/taskStorage";
import { Tag, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletedTasksProps {
  selectedDate?: Date;
  onGenerateTest: (
    featureName: string,
    description: string,
    taskId: string
  ) => void;
  loadedTaskId: string | null;
  isLoading: boolean;
}

export function CompletedTasks({
  selectedDate,
  onGenerateTest,
  loadedTaskId,
  isLoading,
}: CompletedTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadedTasks = loadTasks();
    const completedTasks = loadedTasks.filter((task) => {
      // First filter for completed tasks
      if (task.status !== TaskStatus.DONE) return false;

      // If selectedDate is provided, filter by date
      if (selectedDate && task.date) {
        const taskDate = new Date(task.date);
        return (
          taskDate.getDate() === selectedDate.getDate() &&
          taskDate.getMonth() === selectedDate.getMonth() &&
          taskDate.getFullYear() === selectedDate.getFullYear()
        );
      }

      // If no selectedDate, show all completed tasks
      return true;
    });
    setTasks(completedTasks);
  }, [selectedDate]);

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
              <span className="text-sm text-muted-foreground line-through mb-3">
                {task.description}
              </span>
              <Button
                className="w-full"
                variant={loadedTaskId === task.id ? "default" : "outline"}
                onClick={() =>
                  onGenerateTest(task.featureName, task.description, task.id)
                }
                disabled={isLoading}
              >
                {isLoading && loadedTaskId === task.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : loadedTaskId === task.id ? (
                  "Data Fetched!"
                ) : (
                  "Generate AI Test Case"
                )}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
