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
import { useState, useEffect } from "react";
import { Task, TaskPriority, TaskStatus } from "@/lib/utils";
import { Plus, Tag, Clock } from "lucide-react";
import { createTaskInSupabase, fetchTasks } from "@/lib/taskStorage";
import { toast } from "sonner";

interface CreateTaskModalProps {
  selectedDate?: Date;
  onTaskCreated?: (tasks: Task[]) => void;
  isOpen?: boolean;
  onClose?: () => void;
  defaultFeatureName?: string;
  defaultDescription?: string;
  defaultPriority?: TaskPriority;
  defaultEstimatedHours?: number;
  defaultEstimatedMinutes?: number;
  onSubmit?: (task: {
    featureName: string;
    description: string;
    priority: TaskPriority;
    estimatedHours: number;
    estimatedMinutes: number;
  }) => void;
}

export function CreateTaskModal({
  selectedDate,
  onTaskCreated,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  defaultFeatureName = "",
  defaultDescription = "",
  defaultPriority = TaskPriority.LOW,
  defaultEstimatedHours = 0,
  defaultEstimatedMinutes = 0,
  onSubmit: externalOnSubmit,
}: CreateTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [featureName, setFeatureName] = useState(defaultFeatureName);
  const [description, setDescription] = useState(defaultDescription);
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority);
  const [estimatedHours, setEstimatedHours] = useState(defaultEstimatedHours);
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    defaultEstimatedMinutes
  );

  useEffect(() => {
    if (externalIsOpen ?? isOpen) {
      setFeatureName(defaultFeatureName);
      setDescription(defaultDescription);
      setPriority(defaultPriority);
      setEstimatedHours(defaultEstimatedHours);
      setEstimatedMinutes(defaultEstimatedMinutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    externalIsOpen,
    isOpen,
    defaultFeatureName,
    defaultDescription,
    defaultPriority,
    defaultEstimatedHours,
    defaultEstimatedMinutes,
  ]);

  const handleOpenChange = (open: boolean) => {
    if (externalIsOpen !== undefined) {
      externalOnClose?.();
    } else {
      setIsOpen(open);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (externalOnSubmit) {
        externalOnSubmit({
          featureName,
          description,
          priority,
          estimatedHours,
          estimatedMinutes,
        });
      } else {
        const taskDate = selectedDate || new Date();
        const formattedDate = `${taskDate.getFullYear()}-${String(
          taskDate.getMonth() + 1
        ).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;

        const newTask: Task = {
          id: crypto.randomUUID(),
          featureName,
          description,
          status: TaskStatus.UNTOUCHED,
          date: formattedDate,
          createdAt: new Date().toISOString(),
          startedAt: undefined,
          priority,
          estimatedHours,
          estimatedMinutes,
          order: 0,
        };

        const createdTask = await createTaskInSupabase(newTask);

        if (createdTask) {
          const allTasks = await fetchTasks();
          onTaskCreated?.(allTasks);
          toast.success("Task created successfully!");

          setFeatureName("");
          setDescription("");
          setPriority(TaskPriority.LOW);
          setEstimatedHours(0);
          setEstimatedMinutes(0);

          if (externalIsOpen === undefined) {
            setIsOpen(false);
          } else {
            externalOnClose?.();
          }
        } else {
          toast.error("Failed to create task");
        }
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={externalIsOpen ?? isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="relative overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="featureName"
                placeholder="Feature/Bug Name..."
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <RichTextEditor
                key={defaultDescription}
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
                      onClick={() => setPriority(TaskPriority.LOW)}
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
              <Button type="submit">Create Task</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
