"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/lib/utils";
import { loadTasks } from "@/lib/taskStorage";
import { Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletedTasksProps {
  selectedDate?: Date;
}

export function CompletedTasks({ selectedDate }: CompletedTasksProps) {
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
              <Button className="w-full" variant="outline">
                Generate AI Test Case
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
