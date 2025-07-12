"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/lib/utils";
import { fetchCompletedTasks } from "@/lib/taskStorage";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CompletedTasksProps {
  selectedDate: Date;
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
  const [allCompleted, setAllCompleted] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const getCompletedTasks = async () => {
      setIsFetching(true);
      try {
        const completed = await fetchCompletedTasks();
        setAllCompleted(completed);
      } catch (error) {
        console.error("Failed to fetch completed tasks", error);
        toast.error("Could not load completed tasks.");
      } finally {
        setIsFetching(false);
      }
    };
    getCompletedTasks();
  }, []);

  const tasks = allCompleted.filter((task) => {
    if (!task.date) return false;
    const taskDate = new Date(task.date);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  if (isFetching) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <Card className="p-4 border-dashed">
          <p className="text-center text-muted-foreground">
            No completed tasks for this date.
          </p>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="p-4 shadow-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-base text-primary">
                {task.featureName}
              </span>
              <div
                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
              <Button
                className="w-full mt-3"
                variant={loadedTaskId === task.id ? "default" : "outline"}
                onClick={() =>
                  onGenerateTest(task.featureName, task.description, task.id)
                }
                disabled={isLoading || loadedTaskId === task.id}
              >
                {loadedTaskId === task.id
                  ? "Test Case Generated"
                  : "Generate AI Test Case"}
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
