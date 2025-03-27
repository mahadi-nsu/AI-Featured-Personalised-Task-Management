"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Plus,
  Trash2,
  Pencil,
  CalendarClock,
  GripVertical,
  ListTodo,
  Trello,
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

// View modes
type ViewMode = "list" | "kanban";

// Sortable task item component
function SortableTaskItem({ task }: { task: Task }) {
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
    updateTask(task.id, { status });
    // We'll handle state update in parent component
    window.location.reload(); // Temporary solution for state refresh
  };

  const startDelete = (task: Task) => {
    setDeletingTask(task);
  };

  const confirmDelete = () => {
    if (deletingTask) {
      deleteTask(deletingTask.id);
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
      updateTask(editingTask.id, {
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
  const [editedTitle, setEditedTitle] = useState("");

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
  };

  const saveEdit = () => {
    if (editingTask && editedTitle.trim()) {
      const updatedTasks = updateTask(editingTask.id, {
        title: editedTitle.trim(),
      });
      setEditingTask(null);
      setTasks(updatedTasks);
    }
  };

  return (
    <>
      <div ref={setNodeRef} style={style} className="touch-none">
        <Card className="p-3 mb-2 group">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing w-full pb-2 px-1 text-sm font-medium"
              >
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
              <div className="flex items-center gap-1 pt-2 border-t">
                <div className="flex-1"></div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEditing(task)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startDelete(task)}
                  >
                    <Trash2 className="h-3 w-3" />
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
  return (
    <Card className="p-3 mb-2 w-[300px] shadow-md opacity-90 border-2 border-primary">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="w-full pb-2 px-1 text-sm font-medium">
            <span
              className={
                task.status === TaskStatus.DONE
                  ? "line-through text-muted-foreground"
                  : ""
              }
            >
              {task.title}
            </span>
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

  // Group tasks by status for Kanban view
  const untouchedTasks = todaysTasks.filter(
    (task) => task.status === TaskStatus.UNTOUCHED
  );
  const inProgressTasks = todaysTasks.filter(
    (task) => task.status === TaskStatus.IN_PROGRESS
  );
  const doneTasks = todaysTasks.filter(
    (task) => task.status === TaskStatus.DONE
  );

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
      // Handle kanban mode drag end - change status based on column
      else {
        const task = tasks.find((t) => t.id === activeId);
        if (!task) return;

        let newStatus: TaskStatus;

        // Determine the target column (status) based on the over.id
        if (overId === "untouched-column") {
          newStatus = TaskStatus.UNTOUCHED;
        } else if (overId === "inprogress-column") {
          newStatus = TaskStatus.IN_PROGRESS;
        } else if (overId === "done-column") {
          newStatus = TaskStatus.DONE;
        } else {
          // If dragging over another card, get that card's status
          const overTask = tasks.find((t) => t.id === overId);
          if (!overTask) return;
          newStatus = overTask.status;
        }

        console.log(`Changing task status from ${task.status} to ${newStatus}`);

        // If status has changed, update it
        if (task.status !== newStatus) {
          const updatedTasks = updateTask(task.id, { status: newStatus });
          setTasks(updatedTasks);
        }
      }
    }
  };

  return (
    <>
      <div className="w-full mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Today&apos;s Tasks</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4 mr-1" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
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
          </div>
        </div>

        <Card className="p-6 shadow-sm">
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
          ) : viewMode === "list" ? (
            // List View
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
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
