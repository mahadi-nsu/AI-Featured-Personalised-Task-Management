"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Pencil, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import {
  loadTasks,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
} from "@/lib/taskStorage";

// Interface for old todos format
interface OldTodo {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
}

export function DateTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

  // Load tasks on component mount
  useEffect(() => {
    const tasks = loadTasks();
    console.log("DateTasks - Loaded tasks:", tasks);
    setTasks(tasks);
  }, []);

  // Get tasks for selected date
  const dateTasksOnly = tasks.filter((task) => {
    if (!task.date) return false;

    try {
      const taskDate = new Date(task.date);
      const selectedDate = new Date(date);

      // Check if the date is valid
      if (isNaN(taskDate.getTime())) {
        console.error("Invalid task date:", task.date);
        return false;
      }

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

  const createTask = (data: { title: string }) => {
    // Format the date consistently
    const formattedDate = format(date, "yyyy-MM-dd");

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      status: TaskStatus.UNTOUCHED,
      date: formattedDate,
      createdAt: new Date().toISOString(),
    };

    console.log("Creating new task:", newTask);

    // Use the centralized storage
    const updatedTasks = addTask(newTask);
    setTasks(updatedTasks);

    reset();
  };

  const updateTaskStatus = (task: Task, status: TaskStatus) => {
    const updatedTasks = updateTask(task.id, { status });
    setTasks(updatedTasks);
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = () => {
    if (deletingTask) {
      const updatedTasks = deleteTask(deletingTask.id);
      setTasks(updatedTasks);
      setDeletingTask(null);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
  };

  const saveEdit = () => {
    if (editingTask && editedTitle.trim()) {
      const updatedTasks = updateTask(editingTask.id, {
        title: editedTitle.trim(),
      });
      setTasks(updatedTasks);
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
          <h2 className="text-2xl font-bold">Tasks by Date</h2>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[240px] justify-start text-left font-normal")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit(createTask)}
            className="flex items-center gap-4"
          >
            <Input
              placeholder={`Add a task for ${format(date, "MMMM d, yyyy")}...`}
              {...register("title", { required: true })}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {dateTasksOnly.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks for {format(date, "MMMM d, yyyy")}. Add one to get
              started!
            </div>
          ) : (
            dateTasksOnly.map((task) => (
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
