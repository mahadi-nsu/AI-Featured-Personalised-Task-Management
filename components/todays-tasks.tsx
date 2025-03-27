"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Pencil, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Task, TaskStatus } from "@/lib/utils";

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Get today's tasks
  const todaysTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date);
    const today = new Date();

    return (
      taskDate.getDate() === today.getDate() &&
      taskDate.getMonth() === today.getMonth() &&
      taskDate.getFullYear() === today.getFullYear()
    );
  });

  const createTask = (data: { title: string }) => {
    const today = new Date().toISOString().split("T")[0];

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      status: TaskStatus.UNTOUCHED,
      date: today,
      createdAt: new Date().toISOString(),
    };

    setTasks([...tasks, newTask]);
    reset();
  };

  const updateTaskStatus = (task: Task, status: TaskStatus) => {
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status } : t)));
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = () => {
    if (deletingTask) {
      setTasks(tasks.filter((task) => task.id !== deletingTask.id));
      setDeletingTask(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
  };

  const saveEdit = () => {
    if (editingTask && editedTitle.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, title: editedTitle.trim() }
            : task
        )
      );
      setEditingTask(null);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return "text-green-500";
      case TaskStatus.IN_PROGRESS:
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Today&apos;s Tasks</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit(createTask)}
            className="flex items-center gap-4"
          >
            <Input
              placeholder="Add a new task for today..."
              {...register("title", { required: true })}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks for today. Add one to get started!
            </div>
          ) : (
            todaysTasks.map((task) => (
              <Card
                key={task.id}
                className="p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span
                    className={`${
                      task.status === TaskStatus.DONE
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={task.status}
                    onValueChange={(value) =>
                      updateTaskStatus(task, value as TaskStatus)
                    }
                  >
                    <SelectTrigger
                      className={`w-[140px] ${getStatusColor(
                        task.status as TaskStatus
                      )}`}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.UNTOUCHED}>
                        Untouched
                      </SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(task)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startDelete(task)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingTask !== null}
        onOpenChange={() => setEditingTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Edit task title..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingTask !== null}
        onOpenChange={() => setDeletingTask(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task &quot;{deletingTask?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
