"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Trash2,
  Pencil,
  CalendarIcon,
  GripVertical,
  Tag,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Task, TaskStatus, TaskPriority } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  fetchTasks,
  updateTaskInSupabase,
  deleteTask,
  updateTasksOrderInSupabase,
} from "@/lib/taskStorage";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { CreateTaskModal } from "@/components/create-task-modal";
import { TaskFormModal } from "@/components/task-form-modal";

// Date Tasks Component
// This component manages tasks for specific dates with drag and drop functionality.
// Key features include:
// - Calendar-based task organization
// - Task creation with priority and estimated time
// - Real-time countdown timer for in-progress tasks
// - Sound notifications and visual feedback
// - Drag and drop task reordering

// Interface for old todos format
interface OldTodo {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
}

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

// Sortable task item component
// Handles:
// - Drag and drop functionality
// - Task status management
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
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
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

  const updateTaskStatus = async (task: Task, status: TaskStatus) => {
    // Optimistically update the UI
    const optimisticTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, status } : t
    );
    setTasks(optimisticTasks);

    try {
      const updatedTasks = await updateTaskInSupabase(task.id, { status });
      if (Array.isArray(updatedTasks) && updatedTasks.length > 0) {
        setTasks(updatedTasks);
        toast.success("Task status updated", {
          description: `"${task.featureName}" has been ${
            status === TaskStatus.UNTOUCHED
              ? "marked as untouched"
              : status === TaskStatus.IN_PROGRESS
              ? "moved to in progress"
              : "marked as completed"
          }.`,
        });
      } else {
        const latestTasks = await fetchTasks();
        setTasks(latestTasks);
        toast.error("Failed to update task status");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      const latestTasks = await fetchTasks();
      setTasks(latestTasks);
      toast.error("Failed to update task status");
    }
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

        // Show success toast
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
    setEditingTask({ ...task });
  };

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

  // Format estimated time display
  const getEstimatedTimeDisplay = (task: Task) => {
    if (!task.estimatedHours && !task.estimatedMinutes) return null;
    const parts = [];
    if (task.estimatedHours) parts.push(`${task.estimatedHours}h`);
    if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes}m`);
    return parts.join(" ");
  };

  // Add countdown effect
  useEffect(() => {
    if (task.status === TaskStatus.IN_PROGRESS) {
      // Set start time if not already set
      if (!task.startedAt) {
        const setStartTime = async () => {
          try {
            const updatedTasks = await updateTaskInSupabase(task.id, {
              startedAt: new Date().toISOString(),
            });
            setTasks(updatedTasks);
          } catch (error) {
            console.error("Failed to set task start time:", error);
            toast.error("Failed to start timer for task");
          }
        };
        setStartTime();
      }

      // Start countdown
      const interval = setInterval(() => {
        const remaining = calculateRemainingTime(task);
        setRemainingTime(remaining);

        // Play sound when 5 minutes or less remain
        if (remaining !== null && remaining <= 5 && remaining > 0) {
          audioRef.current?.play();
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setRemainingTime(null);
    }
  }, [
    task.status,
    task.id,
    task.startedAt,
    task.estimatedHours,
    task.estimatedMinutes,
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
            task.status === TaskStatus.IN_PROGRESS &&
              !remainingTime &&
              "border-primary",
            // Warning state: 5 minutes or less remaining
            remainingTime !== null &&
              remainingTime <= 5 &&
              remainingTime > 0 &&
              "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/20",
            // Time-up state: 0 minutes remaining
            remainingTime !== null &&
              remainingTime <= 0 &&
              "border-red-400 bg-red-50 dark:bg-red-500/20"
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {getEstimatedTimeDisplay(task)}
                  </span>
                )}
                {remainingTime !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      remainingTime <= 0
                        ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/20"
                        : remainingTime <= 5
                        ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/20"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/20"
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
            <div className="flex items-center gap-2">
              <Select
                value={task.status}
                onValueChange={async (value) =>
                  await updateTaskStatus(task, value as TaskStatus)
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
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => startDelete(task)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <TaskFormModal
        key={editingTask?.id}
        open={editingTask !== null}
        mode="edit"
        initialValues={
          editingTask
            ? {
                featureName: editingTask.featureName,
                description: editingTask.description,
                priority: editingTask.priority,
                estimatedHours: editingTask.estimatedHours || 0,
                estimatedMinutes: editingTask.estimatedMinutes || 0,
                id: editingTask.id,
                status: editingTask.status,
                date: editingTask.date,
                createdAt: editingTask.createdAt,
              }
            : {}
        }
        onSubmit={async (values) => {
          if (editingTask) {
            try {
              const updatedTasks = await updateTaskInSupabase(
                editingTask.id,
                values
              );
              setEditingTask(null);
              setTasks(updatedTasks);
              toast.success("Task updated successfully", {
                description: `"${values.featureName}" has been updated.`,
              });
            } catch (error) {
              console.error("Error updating task:", error);
              toast.error("Failed to update task");
            }
          }
        }}
        onClose={() => setEditingTask(null)}
      />

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

// Dragged task preview component
// Shows a simplified version of the task while being dragged
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

  // Format estimated time display
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

export function DateTasks() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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
    const loadInitialTasks = async () => {
      setIsLoading(true);
      try {
        const loadedTasks = await fetchTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Failed to load tasks.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialTasks();
  }, []);

  // Get tasks for selected date
  const dateTasksOnly = tasks
    .filter((task) => {
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
    })
    .sort((a, b) => {
      // Sort by order property if available, otherwise fallback to creation date
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

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

  // Handle drag end event
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (over && active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);

      // Find the tasks in the array
      const activeIndex = dateTasksOnly.findIndex(
        (task) => task.id === activeId
      );
      const overIndex = dateTasksOnly.findIndex((task) => task.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Get the new order of tasks
        const newTasks = arrayMove(dateTasksOnly, activeIndex, overIndex);

        // Optimistically update the UI
        setTasks((prevTasks) => {
          const updatedTasks = [...prevTasks];
          newTasks.forEach((task, index) => {
            const taskIndex = updatedTasks.findIndex((t) => t.id === task.id);
            if (taskIndex !== -1) {
              updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                order: index,
              };
            }
          });
          return updatedTasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        });

        try {
          const taskUpdates = newTasks.map((task, index) => ({
            id: task.id,
            order: index,
          }));
          const updatedTasks = await updateTasksOrderInSupabase(taskUpdates);

          if (Array.isArray(updatedTasks) && updatedTasks.length > 0) {
            setTasks(updatedTasks);
          } else {
            const latestTasks = await fetchTasks();
            setTasks(latestTasks);
            toast.error("Failed to update task order");
          }
        } catch (error) {
          console.error("Error updating task order:", error);
          const latestTasks = await fetchTasks();
          setTasks(latestTasks);
          toast.error("Failed to update task order");
        }
      }
    }
  };

  return (
    <>
      <div className="w-full mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tasks by Date</h2>
          <div className="flex items-center gap-4">
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
        </div>

        <div className="flex justify-end mb-4">
          <CreateTaskModal selectedDate={date} onTaskCreated={setTasks} />
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tasks...
            </div>
          ) : dateTasksOnly.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tasks for {format(date, "MMMM d, yyyy")}. Add one to get
              started!
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={dateTasksOnly.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {dateTasksOnly.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      tasks={tasks}
                      setTasks={setTasks}
                    />
                  ))}
                </div>
              </SortableContext>

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
