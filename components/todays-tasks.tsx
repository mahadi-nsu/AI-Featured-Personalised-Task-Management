"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Trash2,
  Pencil,
  CalendarClock,
  GripVertical,
  ListTodo,
  Trello,
  Tag,
  Clock,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Task, TaskStatus, TaskPriority } from "@/lib/utils";
import {
  loadTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskOrder,
  fetchTasks,
} from "@/lib/taskStorage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  closestCorners,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { CreateTaskModal } from "@/components/create-task-modal";

// View modes
type ViewMode = "list" | "kanban";

// Today's Tasks Component
// This component handles tasks for the current day with both list and kanban board views.
// Key features include:
// - Task creation with priority and estimated time
// - Real-time countdown timer for in-progress tasks
// - Sound notifications for tasks nearing completion
// - Drag and drop functionality for task reordering
// - Search and filter capabilities

// Helper function to calculate remaining time for tasks
// Returns null if:
// - Task has no estimated time
// - Task is not in progress
// - Task has no start time
function calculateRemainingTime(task: Task): number | null {
  if (!task.estimatedHours && !task.estimatedMinutes) return null;
  if (task.status !== TaskStatus.IN_PROGRESS) return null;

  const totalMinutes =
    (task.estimatedHours || 0) * 60 + (task.estimatedMinutes || 0);
  const startTime = task.startedAt ? new Date(task.startedAt).getTime() : null;

  if (!startTime) return null;

  const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
  const remainingMinutes = totalMinutes - elapsedMinutes;

  return Math.max(0, remainingMinutes);
}

// Sortable task item component for list view
// Handles:
// - Drag and drop functionality
// - Task status updates
// - Time tracking and notifications
// - Visual feedback for time states
function SortableTaskItem({
  task,
  tasks,
  setTasks,
}: {
  task: Task;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editedFeatureName, setEditedFeatureName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPriority, setEditedPriority] = useState<
    TaskPriority | undefined
  >(undefined);
  const [editedHours, setEditedHours] = useState<number>(0);
  const [editedMinutes, setEditedMinutes] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstimatedTimeDisplay = (task: Task) => {
    if (!task.estimatedHours && !task.estimatedMinutes) return null;
    const parts = [];
    if (task.estimatedHours) parts.push(`${task.estimatedHours}h`);
    if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes}m`);
    return parts.join(" ");
  };

  const updateTaskStatus = (task: Task, status: TaskStatus) => {
    const updatedTasks = updateTask(task.id, { status });
    setTasks(updatedTasks);

    const statusMessages = {
      [TaskStatus.UNTOUCHED]: "marked as untouched",
      [TaskStatus.IN_PROGRESS]: "moved to in progress",
      [TaskStatus.DONE]: "marked as completed",
    };

    toast.success("Task status updated", {
      description: `"${task.featureName}" has been ${statusMessages[status]}.`,
    });
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = async () => {
    if (deletingTask) {
      try {
        const updatedTasks = await deleteTask(deletingTask.id);
        setDeletingTask(null);
        setTasks(updatedTasks);
        toast.success("Task deleted successfully", {
          description: `"${deletingTask.featureName}" has been removed from your task list.`,
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedFeatureName(task.featureName);
    setEditedDescription(task.description);
    setEditedPriority(task.priority);
    setEditedHours(task.estimatedHours || 0);
    setEditedMinutes(task.estimatedMinutes || 0);
  };

  const saveEdit = () => {
    if (editingTask && editedFeatureName.trim() && editedDescription.trim()) {
      const updatedTasks = updateTask(editingTask.id, {
        featureName: editedFeatureName.trim(),
        description: editedDescription.trim(),
        priority: editedPriority,
        estimatedHours: editedHours || undefined,
        estimatedMinutes: editedMinutes || undefined,
      });
      setEditingTask(null);
      setTasks(updatedTasks);
      toast.success("Task updated successfully", {
        description: `"${editedFeatureName}" has been updated.`,
      });
    }
  };

  // Add countdown effect
  useEffect(() => {
    if (task.status === TaskStatus.IN_PROGRESS) {
      // Set start time if not already set
      if (!task.startedAt) {
        const updatedTasks = updateTask(task.id, {
          startedAt: new Date().toISOString(),
        });
        setTasks(updatedTasks);
      }

      // Check initial remaining time and play sound if needed
      const initialRemaining = calculateRemainingTime(task);
      setRemainingTime(initialRemaining);
      if (
        initialRemaining !== null &&
        initialRemaining <= 5 &&
        initialRemaining > 0 &&
        isNotificationEnabled
      ) {
        audioRef.current?.play();
      }

      // Start countdown
      const interval = setInterval(() => {
        const remaining = calculateRemainingTime(task);
        setRemainingTime(remaining);

        // Play sound when 5 minutes or less remain and notification is enabled
        if (
          remaining !== null &&
          remaining <= 5 &&
          remaining > 0 &&
          isNotificationEnabled
        ) {
          audioRef.current?.play();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(null);
      setIsNotificationEnabled(true); // Reset notification state when task status changes
    }
  }, [
    task.status,
    task.id,
    task.startedAt,
    task.estimatedHours,
    task.estimatedMinutes,
    isNotificationEnabled,
  ]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" />
      <div ref={setNodeRef} style={style} className="touch-none">
        <Card
          className={cn(
            "p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group",
            // Warning state: 5 minutes or less remaining
            remainingTime !== null &&
              remainingTime <= 5 &&
              remainingTime > 0 &&
              "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
            // Time-up state: 0 minutes remaining
            remainingTime !== null &&
              remainingTime <= 0 &&
              "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800"
          )}
        >
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md mt-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-medium text-base text-primary truncate">
                {task.featureName}
              </span>
              <div
                className={`text-sm text-muted-foreground ${
                  task.status === TaskStatus.DONE ? "line-through" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
              <div className="flex flex-wrap gap-2 mt-1">
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
                {remainingTime !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      remainingTime <= 0
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                        : remainingTime <= 5
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                        : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                    )}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {remainingTime <= 0
                      ? "Time's Up!"
                      : `${formatTime(remainingTime)} remaining`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {remainingTime !== null &&
              remainingTime <= 5 &&
              remainingTime > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsNotificationEnabled(false)}
                  className={cn(
                    "text-red-500 hover:text-red-600 hover:bg-red-50",
                    !isNotificationEnabled && "opacity-50"
                  )}
                  title={
                    isNotificationEnabled
                      ? "Stop notification sound"
                      : "Notifications disabled"
                  }
                >
                  <div className="relative">
                    <Bell className="h-4 w-4" />
                    {!isNotificationEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-[2px] bg-red-500 rotate-45 transform origin-center" />
                      </div>
                    )}
                  </div>
                </Button>
              )}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startEditing(task)}
              >
                <Pencil className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startDelete(task)}
              >
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingTask !== null}
        onOpenChange={() => setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              value={editedFeatureName}
              onChange={(e) => setEditedFeatureName(e.target.value)}
              placeholder="Edit feature/bug name..."
              className="w-full"
            />
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.HIGH ? "default" : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.HIGH
                      ? "bg-red-500 hover:bg-red-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.HIGH)}
                >
                  High
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.MEDIUM
                      ? "default"
                      : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.MEDIUM
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.MEDIUM)}
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.LOW ? "default" : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.LOW
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.LOW)}
                >
                  Low
                </Button>
                {editedPriority && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditedPriority(undefined)}
                  >
                    No Priority
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated Time
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={editedHours}
                    onChange={(e) =>
                      setEditedHours(parseInt(e.target.value) || 0)
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
                    value={editedMinutes}
                    onChange={(e) =>
                      setEditedMinutes(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  <span className="text-sm whitespace-nowrap">minutes</span>
                </div>
              </div>
            </div>
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
              task &quot;{deletingTask?.featureName} -{" "}
              {deletingTask?.description}&quot;.
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

// Kanban Task Item component
function KanbanTaskItem({
  task,
  tasks,
  setTasks,
}: {
  task: Task;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editedFeatureName, setEditedFeatureName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedPriority, setEditedPriority] = useState<
    TaskPriority | undefined
  >(undefined);
  const [editedHours, setEditedHours] = useState<number>(0);
  const [editedMinutes, setEditedMinutes] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstimatedTimeDisplay = (task: Task) => {
    if (!task.estimatedHours && !task.estimatedMinutes) return null;
    const parts = [];
    if (task.estimatedHours) parts.push(`${task.estimatedHours}h`);
    if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes}m`);
    return parts.join(" ");
  };

  const updateTaskStatus = (task: Task, status: TaskStatus) => {
    const updatedTasks = updateTask(task.id, { status });
    setTasks(updatedTasks);

    const statusMessages = {
      [TaskStatus.UNTOUCHED]: "marked as untouched",
      [TaskStatus.IN_PROGRESS]: "moved to in progress",
      [TaskStatus.DONE]: "marked as completed",
    };

    toast.success("Task status updated", {
      description: `"${task.featureName}" has been ${statusMessages[status]}.`,
    });
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = async () => {
    if (deletingTask) {
      try {
        const updatedTasks = await deleteTask(deletingTask.id);
        setDeletingTask(null);
        setTasks(updatedTasks);
        toast.success("Task deleted successfully", {
          description: `"${deletingTask.featureName}" has been removed from your task list.`,
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task");
      }
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedFeatureName(task.featureName);
    setEditedDescription(task.description);
    setEditedPriority(task.priority);
    setEditedHours(task.estimatedHours || 0);
    setEditedMinutes(task.estimatedMinutes || 0);
  };

  const saveEdit = () => {
    if (editingTask && editedFeatureName.trim() && editedDescription.trim()) {
      const updatedTasks = updateTask(editingTask.id, {
        featureName: editedFeatureName.trim(),
        description: editedDescription.trim(),
        priority: editedPriority,
        estimatedHours: editedHours || undefined,
        estimatedMinutes: editedMinutes || undefined,
      });
      setEditingTask(null);
      setTasks(updatedTasks);
      toast.success("Task updated successfully", {
        description: `"${editedFeatureName}" has been updated.`,
      });
    }
  };

  // Add countdown effect
  useEffect(() => {
    if (task.status === TaskStatus.IN_PROGRESS) {
      // Set start time if not already set
      if (!task.startedAt) {
        const updatedTasks = updateTask(task.id, {
          startedAt: new Date().toISOString(),
        });
        setTasks(updatedTasks);
      }

      // Check initial remaining time and play sound if needed
      const initialRemaining = calculateRemainingTime(task);
      setRemainingTime(initialRemaining);
      if (
        initialRemaining !== null &&
        initialRemaining <= 5 &&
        initialRemaining > 0 &&
        isNotificationEnabled
      ) {
        audioRef.current?.play();
      }

      // Start countdown
      const interval = setInterval(() => {
        const remaining = calculateRemainingTime(task);
        setRemainingTime(remaining);

        // Play sound when 5 minutes or less remain and notification is enabled
        if (
          remaining !== null &&
          remaining <= 5 &&
          remaining > 0 &&
          isNotificationEnabled
        ) {
          audioRef.current?.play();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(null);
      setIsNotificationEnabled(true); // Reset notification state when task status changes
    }
  }, [
    task.status,
    task.id,
    task.startedAt,
    task.estimatedHours,
    task.estimatedMinutes,
    isNotificationEnabled,
  ]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <audio ref={audioRef} src="/notification.mp3" />
      <div ref={setNodeRef} style={style} className="touch-none">
        <Card
          className={cn(
            "p-3 mb-2 group",
            remainingTime !== null &&
              remainingTime <= 5 &&
              remainingTime > 0 &&
              "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800",
            remainingTime !== null &&
              remainingTime <= 0 &&
              "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800"
          )}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing w-full pb-2 px-1"
              >
                <span className="font-medium text-base text-primary block mb-1">
                  {task.featureName}
                </span>
                <div
                  className={`text-sm text-muted-foreground block ${
                    task.status === TaskStatus.DONE ? "line-through" : ""
                  }`}
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
                <div className="flex flex-wrap gap-2 mt-1">
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
                  {remainingTime !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                        remainingTime <= 0
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                          : remainingTime <= 5
                          ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800"
                          : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {remainingTime <= 0
                        ? "Time's Up!"
                        : `${formatTime(remainingTime)} remaining`}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 pt-1">
                {remainingTime !== null &&
                  remainingTime <= 5 &&
                  remainingTime > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsNotificationEnabled(false)}
                      className={cn(
                        "text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6",
                        !isNotificationEnabled && "opacity-50"
                      )}
                      title={
                        isNotificationEnabled
                          ? "Stop notification sound"
                          : "Notifications disabled"
                      }
                    >
                      <div className="relative">
                        <Bell className="h-3 w-3" />
                        {!isNotificationEnabled && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-[1.5px] bg-red-500 rotate-45 transform origin-center" />
                          </div>
                        )}
                      </div>
                    </Button>
                  )}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(task)}
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startDelete(task)}
                  >
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
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
          <div className="py-4 space-y-4">
            <Input
              value={editedFeatureName}
              onChange={(e) => setEditedFeatureName(e.target.value)}
              placeholder="Edit feature/bug name..."
              className="w-full"
            />
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.HIGH ? "default" : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.HIGH
                      ? "bg-red-500 hover:bg-red-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.HIGH)}
                >
                  High
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.MEDIUM
                      ? "default"
                      : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.MEDIUM
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.MEDIUM)}
                >
                  Medium
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    editedPriority === TaskPriority.LOW ? "default" : "outline"
                  }
                  className={
                    editedPriority === TaskPriority.LOW
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                  onClick={() => setEditedPriority(TaskPriority.LOW)}
                >
                  Low
                </Button>
                {editedPriority && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditedPriority(undefined)}
                  >
                    No Priority
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Estimated Time
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    min="0"
                    value={editedHours}
                    onChange={(e) =>
                      setEditedHours(parseInt(e.target.value) || 0)
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
                    value={editedMinutes}
                    onChange={(e) =>
                      setEditedMinutes(parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                  <span className="text-sm whitespace-nowrap">minutes</span>
                </div>
              </div>
            </div>
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
              task &quot;{deletingTask?.featureName} -{" "}
              {deletingTask?.description}&quot;.
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

// Add a new droppable container component for columns
function KanbanColumn({
  id,
  title,
  tasks,
  color,
  children,
}: {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  children: React.ReactNode;
}) {
  // Set up the column as a droppable area
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-background border rounded-md shadow-sm overflow-hidden h-full ${
        isOver ? "ring-2 ring-primary ring-opacity-70 bg-primary/5" : ""
      }`}
    >
      <div className="p-3 bg-muted font-medium border-b">
        <div className="flex items-center">
          <span className={`${color} w-3 h-3 rounded-full mr-2`}></span>
          <span>{title}</span>
          <span className="ml-auto bg-muted-foreground/20 px-2 py-0.5 rounded-full text-xs">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="p-2 min-h-[300px]">{children}</div>
    </div>
  );
}

// Add active task component for the drag overlay
function DraggedTaskItem({ task }: { task: Task }) {
  // Get priority badge color
  const getPriorityColor = (priority?: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "bg-red-100 text-red-800 border-red-200";
      case TaskPriority.MEDIUM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case TaskPriority.LOW:
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstimatedTimeDisplay = (task: Task) => {
    if (!task.estimatedHours && !task.estimatedMinutes) return null;
    const parts = [];
    if (task.estimatedHours) parts.push(`${task.estimatedHours}h`);
    if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes}m`);
    return parts.join(" ");
  };

  return (
    <Card className="p-4 w-full shadow-md opacity-90 border-2 border-primary">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-base text-primary">
              {task.featureName}
            </span>
            <div
              className={`text-sm text-muted-foreground ${
                task.status === TaskStatus.DONE ? "line-through" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: task.description }}
            />
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
        </div>
      </div>
    </Card>
  );
}

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);
  const [description, setDescription] = useState("");
  const { register, handleSubmit, reset } = useForm<{
    featureName: string;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks on component mount
  useEffect(() => {
    const loadTasksFromSupabase = async () => {
      const loadedTasks = await fetchTasks();
      console.log("TodaysTasks - Loaded tasks:", loadedTasks);
      setTasks(loadedTasks);
    };

    loadTasksFromSupabase();
  }, []);

  // Get today's tasks
  const todaysTasks = tasks
    .filter((task) => {
      if (!task.date) return false;

      try {
        const taskDate = new Date(task.date);
        const today = new Date();

        // Check if the date is valid
        if (isNaN(taskDate.getTime())) {
          console.error("Invalid task date:", task.date);
          return false;
        }

        // Reset time part for comparison
        taskDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return (
          taskDate.getDate() === today.getDate() &&
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        );
      } catch (error) {
        console.error("Error comparing dates:", error);
        return false;
      }
    })
    .sort((a, b) => {
      // Sort by order property if available, otherwise fallback to creation date
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // Update the filteredTasks function to handle both featureName and description
  const filteredTasks = todaysTasks.filter((task) => {
    // Search filter - check both featureName and description
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      task.featureName?.toLowerCase().includes(searchLower) ||
      false ||
      task.description?.toLowerCase().includes(searchLower) ||
      false;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status for Kanban view
  const untouchedTasks = filteredTasks.filter(
    (task) => task.status === TaskStatus.UNTOUCHED
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = filteredTasks.filter(
    (task) => task.status === TaskStatus.DONE
  );

  const createTask = (data: { featureName: string }) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const newTask: Task = {
      id: crypto.randomUUID(),
      featureName: data.featureName,
      description: description,
      status: TaskStatus.UNTOUCHED,
      date: formattedDate,
      createdAt: new Date().toISOString(),
      priority: priority,
      estimatedHours: estimatedHours || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
    };

    const updatedTasks = addTask(newTask);
    setTasks(updatedTasks);

    // Show success toast
    toast.success("Task created successfully", {
      description: `"${data.featureName}" has been added to your task list.`,
    });

    // Reset form
    reset();
    setDescription("");
    setPriority(undefined);
    setEstimatedHours(0);
    setEstimatedMinutes(0);
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    setActiveId(id);

    // Find the task to display in the drag overlay
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setActiveTask(task);
    }
  };

  // Handle drag over event - to add visual feedback
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Skip processing if dragging over itself
    if (active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if we're dragging over a column
    if (
      ["untouched-column", "inprogress-column", "done-column"].includes(overId)
    ) {
      let targetStatus: TaskStatus;

      if (overId === "untouched-column") {
        targetStatus = TaskStatus.UNTOUCHED;
      } else if (overId === "inprogress-column") {
        targetStatus = TaskStatus.IN_PROGRESS;
      } else {
        targetStatus = TaskStatus.DONE;
      }

      // We don't need to update the status here - just provide visual feedback
      // The status will be updated in handleDragEnd
      console.log(
        `Dragging task over column: ${overId} (status: ${targetStatus})`
      );
    }
    // If dragging over another task, check if it's in a different column
    else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask && activeTask.status !== overTask.status) {
        console.log(
          `Dragging between columns via task: from ${activeTask.status} to ${overTask.status}`
        );
      }
    }
  };

  // Handle drag end for list view
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);

      console.log(`Drag ended: ${activeId} over ${overId}`);

      // Handle list mode drag end
      if (viewMode === "list") {
        // Find the tasks in the array
        const activeIndex = todaysTasks.findIndex(
          (task) => task.id === activeId
        );
        const overIndex = todaysTasks.findIndex((task) => task.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          // Get the new order of task IDs
          const newTasks = arrayMove(todaysTasks, activeIndex, overIndex);
          const newTaskIds = newTasks.map((task) => task.id);

          // Get today's date in yyyy-MM-dd format
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(
            today.getMonth() + 1
          ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

          // Update the order in storage
          const updatedTasks = updateTaskOrder(todayStr, newTaskIds);
          setTasks(updatedTasks);
        }
      }
      // Handle kanban mode drag end
      else {
        const task = tasks.find((t) => t.id === activeId);
        if (!task) return;

        // Check if we're dragging over a column or an item
        if (
          ["untouched-column", "inprogress-column", "done-column"].includes(
            overId
          )
        ) {
          // Dragging to a column - change status
          let newStatus: TaskStatus;

          if (overId === "untouched-column") {
            newStatus = TaskStatus.UNTOUCHED;
          } else if (overId === "inprogress-column") {
            newStatus = TaskStatus.IN_PROGRESS;
          } else {
            newStatus = TaskStatus.DONE;
          }

          // If status has changed, update it
          if (task.status !== newStatus) {
            const updatedTasks = updateTask(task.id, { status: newStatus });
            setTasks(updatedTasks);
          }
        } else {
          // Dragging over another task
          const overTask = tasks.find((t) => t.id === overId);
          if (!overTask) return;

          // If dragging between different columns (status change)
          if (task.status !== overTask.status) {
            const updatedTasks = updateTask(task.id, {
              status: overTask.status,
            });
            setTasks(updatedTasks);
          }
          // If reordering within the same column
          else {
            // Get tasks with the same status
            const columnTasks = todaysTasks.filter(
              (t) => t.status === task.status
            );

            // Find indices within the column
            const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
            const overIndex = columnTasks.findIndex((t) => t.id === overId);

            if (activeIndex !== -1 && overIndex !== -1) {
              // Get the new order using arrayMove
              const newColumnTasks = arrayMove(
                columnTasks,
                activeIndex,
                overIndex
              );

              // Create a new array with all tasks, maintain order for other statuses
              const reorderedTasks = [...tasks];

              // Update the order of each task in the affected column
              newColumnTasks.forEach((t, idx) => {
                const taskIndex = reorderedTasks.findIndex(
                  (rt) => rt.id === t.id
                );
                if (taskIndex !== -1) {
                  reorderedTasks[taskIndex] = {
                    ...reorderedTasks[taskIndex],
                    order: idx,
                  };
                }
              });

              // Get today's date in yyyy-MM-dd format
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(
                today.getMonth() + 1
              ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

              // Update the order in storage
              const updatedTasks = updateTaskOrder(
                todayStr,
                reorderedTasks.map((t) => t.id)
              );
              setTasks(updatedTasks);
            }
          }
        }
      }
    }
  };

  return (
    <>
      <div className="w-full mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300"></div>
            <div className="relative flex items-center bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 group-hover:border-primary/30 transition-all duration-300">
              <CalendarClock className="h-4 w-4 mr-2 text-primary group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium text-foreground/90">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("list")}
              >
                <ListTodo className="h-4 w-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("kanban")}
              >
                <Trello className="h-4 w-4 mr-1" />
                Board
              </Button>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <CreateTaskModal onTaskCreated={setTasks} />
            </div>
          </div>
        </div>

        <Card className="p-4 shadow-sm bg-blue-50/50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/80 dark:bg-gray-900/80"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TaskStatus | "all")
              }
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-900/80">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.UNTOUCHED}>Untouched</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as TaskPriority | "all")
              }
            >
              <SelectTrigger className="bg-white/80 dark:bg-gray-900/80">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {todaysTasks.length === 0
                ? "No tasks for today. Add one to get started!"
                : "No tasks match your filters. Try adjusting your search or filters."}
            </div>
          ) : viewMode === "list" ? (
            // List View
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      tasks={tasks}
                      setTasks={setTasks}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Drag Overlay for List View */}
              <DragOverlay>
                {activeTask && <DraggedTaskItem task={activeTask} />}
              </DragOverlay>
            </DndContext>
          ) : (
            // Kanban Board View
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Untouched Column */}
                <KanbanColumn
                  id="untouched-column"
                  title="Untouched"
                  tasks={untouchedTasks}
                  color="text-gray-500"
                >
                  <SortableContext
                    items={untouchedTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {untouchedTasks.map((task) => (
                      <KanbanTaskItem
                        key={task.id}
                        task={task}
                        tasks={tasks}
                        setTasks={setTasks}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>

                {/* In Progress Column */}
                <KanbanColumn
                  id="inprogress-column"
                  title="In Progress"
                  tasks={inProgressTasks}
                  color="text-blue-500"
                >
                  <SortableContext
                    items={inProgressTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {inProgressTasks.map((task) => (
                      <KanbanTaskItem
                        key={task.id}
                        task={task}
                        tasks={tasks}
                        setTasks={setTasks}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>

                {/* Done Column */}
                <KanbanColumn
                  id="done-column"
                  title="Done"
                  tasks={doneTasks}
                  color="bg-green-500"
                >
                  <SortableContext
                    items={doneTasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {doneTasks.map((task) => (
                      <KanbanTaskItem
                        key={task.id}
                        task={task}
                        tasks={tasks}
                        setTasks={setTasks}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              </div>

              {/* Drag Overlay */}
              <DragOverlay>
                {activeTask && <DraggedTaskItem task={activeTask} />}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
