"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Trash2,
  Pencil,
  CalendarClock,
  GripVertical,
} from "lucide-react";
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
import {
  loadTasks,
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable task item component
function SortableTaskItem({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editedTitle, setEditedTitle] = useState("");

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
    // We'll handle state update in parent component
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = () => {
    if (deletingTask) {
      const updatedTasks = deleteTask(deletingTask.id);
      setDeletingTask(null);
      // We'll handle state update in parent component
      window.location.reload(); // Temporary solution for state refresh
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
      setEditingTask(null);
      // We'll handle state update in parent component
      window.location.reload(); // Temporary solution for state refresh
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="touch-none">
        <Card className="p-4 flex items-center justify-between group">
          <div className="flex items-center gap-4 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
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
                <SelectItem value={TaskStatus.UNTOUCHED}>Untouched</SelectItem>
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

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
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
    console.log("TodaysTasks - Loaded tasks:", loadedTasks);
    setTasks(loadedTasks);
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

  const createTask = (data: { title: string }) => {
    // Format today's date consistently (yyyy-MM-dd)
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      status: TaskStatus.UNTOUCHED,
      date: formattedDate,
      createdAt: new Date().toISOString(),
    };

    console.log("Creating new task for today:", newTask);

    // Use the centralized storage
    const updatedTasks = addTask(newTask);
    setTasks(updatedTasks);

    reset();
  };

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = String(active.id);
      const overId = String(over.id);

      // Find the tasks in the array
      const activeIndex = todaysTasks.findIndex((task) => task.id === activeId);
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todaysTasks.map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {todaysTasks.map((task) => (
                    <SortableTaskItem key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
