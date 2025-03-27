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
  loadTasks,
  saveTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskOrder,
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

// Interface for old todos format
interface OldTodo {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
}

// Add this helper function at the top level
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
  const [editedTitle, setEditedTitle] = useState("");
  const [editedPriority, setEditedPriority] = useState<
    TaskPriority | undefined
  >(undefined);
  const [editedHours, setEditedHours] = useState(0);
  const [editedMinutes, setEditedMinutes] = useState(0);
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
      setDeletingTask(null);
      setTasks(updatedTasks);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditedTitle(task.title);
    setEditedPriority(task.priority);
    setEditedHours(task.estimatedHours || 0);
    setEditedMinutes(task.estimatedMinutes || 0);
  };

  const saveEdit = () => {
    if (editingTask && editedTitle.trim()) {
      const updatedTasks = updateTask(editingTask.id, {
        title: editedTitle.trim(),
        priority: editedPriority,
        estimatedHours: editedHours || undefined,
        estimatedMinutes: editedMinutes || undefined,
      });
      setEditingTask(null);
      setTasks(updatedTasks);
    }
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
        const updatedTasks = updateTask(task.id, {
          startedAt: new Date().toISOString(),
        });
        setTasks(updatedTasks);
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
            "p-4 flex items-center justify-between group",
            remainingTime !== null &&
              remainingTime <= 5 &&
              remainingTime > 0 &&
              "bg-green-50 border-green-200",
            remainingTime !== null &&
              remainingTime <= 0 &&
              "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-center gap-4 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <span
                className={`${
                  task.status === TaskStatus.DONE
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
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
                {remainingTime !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                      remainingTime <= 0
                        ? "bg-red-100 text-red-800 border-red-200"
                        : remainingTime <= 5
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-yellow-100 text-yellow-800 border-yellow-200"
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
                <SelectItem value={TaskStatus.UNTOUCHED}>Untouched</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
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
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Edit task title..."
              className="w-full"
            />

            <div className="space-y-2">
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

// Add DraggedTaskItem component
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
            <span
              className={
                task.status === TaskStatus.DONE
                  ? "line-through text-muted-foreground"
                  : ""
              }
            >
              {task.title}
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
        </div>
      </div>
    </Card>
  );
}

export function DateTasks() {
  const [date, setDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

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
    const loadedTasks = loadTasks();
    console.log("DateTasks - Loaded tasks:", loadedTasks);
    setTasks(loadedTasks);
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

  const createTask = (data: { title: string }) => {
    // Format the date consistently
    const formattedDate = format(date, "yyyy-MM-dd");

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      status: TaskStatus.UNTOUCHED,
      date: formattedDate,
      createdAt: new Date().toISOString(),
      priority: priority,
      estimatedHours: estimatedHours || undefined,
      estimatedMinutes: estimatedMinutes || undefined,
    };

    console.log("Creating new task:", newTask);

    // Use the centralized storage
    const updatedTasks = addTask(newTask);
    setTasks(updatedTasks);

    // Reset form
    reset();
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

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
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
        // Get the new order of task IDs
        const newTasks = arrayMove(dateTasksOnly, activeIndex, overIndex);
        const newTaskIds = newTasks.map((task) => task.id);

        // Get selected date in yyyy-MM-dd format
        const formattedDate = format(date, "yyyy-MM-dd");

        // Update the order in storage
        const updatedTasks = updateTaskOrder(formattedDate, newTaskIds);
        setTasks(updatedTasks);
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

        <Card className="p-6 shadow-sm">
          <form onSubmit={handleSubmit(createTask)} className="space-y-4">
            <div className="flex items-center gap-4">
              <Input
                placeholder={`Add a task for ${format(
                  date,
                  "MMMM d, yyyy"
                )}...`}
                {...register("title", { required: true })}
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
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
          </form>
        </Card>

        <div className="space-y-4">
          {dateTasksOnly.length === 0 ? (
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
