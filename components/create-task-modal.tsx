"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RichTextEditor } from "./ui/rich-text-editor";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/lib/utils";
import { Tag, Clock } from "lucide-react";
import { addTask } from "@/lib/taskStorage";
import { toast } from "sonner";

interface CreateTaskModalProps {
  selectedDate?: Date;
  onTaskCreated?: (tasks: Task[]) => void;
}

export function CreateTaskModal({
  selectedDate,
  onTaskCreated,
}: CreateTaskModalProps) {
  const [featureName, setFeatureName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateTask = () => {
    if (!featureName.trim()) {
      toast.error("Please enter a feature name");
      return;
    }

    const taskDate = selectedDate || new Date();
    const formattedDate = `${taskDate.getFullYear()}-${String(
      taskDate.getMonth() + 1
    ).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;

    const newTask: Task = {
      id: crypto.randomUUID(),
      featureName: featureName.trim(),
      description,
      status: TaskStatus.UNTOUCHED,
      date: formattedDate,
      createdAt: new Date().toISOString(),
      priority: priority || TaskPriority.LOW,
      estimatedHours: estimatedHours || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
    };

    // Add task using the centralized storage
    const updatedTasks = addTask(newTask);

    // Notify parent component
    onTaskCreated?.(updatedTasks);

    // Show success toast
    toast.success("Task created successfully", {
      description: `"${featureName}" has been added to your task list.`,
    });

    // Reset form
    setFeatureName("");
    setDescription("");
    setPriority(undefined);
    setEstimatedHours(0);
    setEstimatedMinutes(0);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              id="featureName"
              placeholder="Feature/Bug Name..."
              value={featureName}
              onChange={(e) => setFeatureName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Task description..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Priority:
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    priority === TaskPriority.HIGH ? "default" : "outline"
                  }
                  className={
                    priority === TaskPriority.HIGH
                      ? "bg-red-500 hover:bg-red-600"
                      : ""
                  }
                  onClick={() => setPriority(TaskPriority.HIGH)}
                >
                  High
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    priority === TaskPriority.MEDIUM ? "default" : "outline"
                  }
                  className={
                    priority === TaskPriority.MEDIUM
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ""
                  }
                  onClick={() => setPriority(TaskPriority.MEDIUM)}
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    priority === TaskPriority.LOW ? "default" : "outline"
                  }
                  className={
                    priority === TaskPriority.LOW
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                  onClick={() => setPriority(TaskPriority.LOW)}
                >
                  Low
                </Button>
                {priority && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setPriority(undefined)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated Time:
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={estimatedHours}
                    onChange={(e) =>
                      setEstimatedHours(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  <span className="text-sm whitespace-nowrap">hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={estimatedMinutes}
                    onChange={(e) =>
                      setEstimatedMinutes(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  <span className="text-sm whitespace-nowrap">minutes</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleCreateTask}>Create Task</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
