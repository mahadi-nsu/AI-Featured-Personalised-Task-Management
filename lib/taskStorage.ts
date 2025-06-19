import { Task, TaskStatus, TaskPriority } from "./utils";
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface for old todos format
interface OldTodo {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
}

// Helper function to safely access localStorage (only on client side)
const getLocalStorage = () => {
  if (typeof window !== "undefined") {
    return window.localStorage;
  }
  return null;
};

// Load tasks from localStorage
export const loadTasks = (): Task[] => {
  const storage = getLocalStorage();
  if (!storage) return [];

  try {
    const savedTasks = storage.getItem("tasks");

    if (savedTasks) {
      console.log("Loading tasks from localStorage:", savedTasks);
      return JSON.parse(savedTasks);
    }

    // Check for old todos format and migrate if needed
    const oldTodos = storage.getItem("todos");
    if (oldTodos) {
      console.log("Migrating old todos:", oldTodos);
      const todos: OldTodo[] = JSON.parse(oldTodos);

      // Format today's date consistently (yyyy-MM-dd)
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const migratedTasks: Task[] = todos.map((todo, index) => ({
        id: todo.id,
        featureName: todo.title,
        description: "",
        status: todo.isComplete ? TaskStatus.DONE : TaskStatus.UNTOUCHED,
        date: formattedDate,
        createdAt: todo.createdAt,
        order: index,
        priority: TaskPriority.MEDIUM,
        estimatedHours: undefined,
        estimatedMinutes: undefined,
      }));

      // Save migrated tasks
      saveTasks(migratedTasks);

      // Remove old todos
      storage.removeItem("todos");

      return migratedTasks;
    }

    // If no tasks exist, create default tasks
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const defaultTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        featureName: "User Registration",
        description:
          "Allow new users to create an account with email, password, and profile information. The registration process includes email verification and password strength validation.",
        status: TaskStatus.DONE,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        order: 0,
        priority: TaskPriority.HIGH,
        estimatedHours: 4,
        estimatedMinutes: 30,
      },
      {
        id: crypto.randomUUID(),
        featureName: "Google Map Integration",
        description:
          "Add google map in nextjs app, add marker, add catchment, draw polygon",
        status: TaskStatus.DONE,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        order: 1,
        priority: TaskPriority.MEDIUM,
        estimatedHours: 6,
        estimatedMinutes: 0,
      },
      {
        id: crypto.randomUUID(),
        featureName: "AI Test Case Generation",
        description:
          "Implement AI-powered test case generation using Gemini API for automated test scenario creation",
        status: TaskStatus.IN_PROGRESS,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        order: 2,
        priority: TaskPriority.HIGH,
        estimatedHours: 8,
        estimatedMinutes: 0,
      },
      {
        id: crypto.randomUUID(),
        featureName: "Password Reset Feature",
        description:
          "Implement secure password reset functionality with email verification, temporary token generation, and password strength validation. Include rate limiting and security measures.",
        status: TaskStatus.IN_PROGRESS,
        date: formattedDate,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        order: 3,
        priority: TaskPriority.HIGH,
        estimatedHours: 3,
        estimatedMinutes: 0,
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        featureName: "User Profile Page",
        description:
          "Create a comprehensive user profile page with avatar upload, personal information management, activity history, and settings. Include responsive design and real-time updates.",
        status: TaskStatus.UNTOUCHED,
        date: formattedDate,
        createdAt: new Date().toISOString(),
        order: 4,
        priority: TaskPriority.MEDIUM,
        estimatedHours: 5,
        estimatedMinutes: 0,
      },
    ];

    // Save default tasks
    saveTasks(defaultTasks);
    return defaultTasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
  }

  return [];
};

// Save tasks to localStorage
export const saveTasks = (tasks: Task[]): void => {
  const storage = getLocalStorage();
  if (!storage) return;

  try {
    console.log("Saving tasks to localStorage:", tasks);
    storage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks:", error);
  }
};

// Add a new task
export const addTask = (task: Task): Task[] => {
  const tasks = loadTasks();

  // Find the highest order value for the same date group
  const tasksForSameDate = tasks.filter((t) => t.date === task.date);
  const highestOrder =
    tasksForSameDate.length > 0
      ? Math.max(...tasksForSameDate.map((t) => t.order || 0))
      : -1;

  // Add new task with the highest order + 1
  const taskWithOrder = {
    ...task,
    order: highestOrder + 1,
  };

  const updatedTasks = [...tasks, taskWithOrder];
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Update a task
export const updateTask = (taskId: string, updates: Partial<Task>): Task[] => {
  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates } : task
  );
  saveTasks(updatedTasks);
  return updatedTasks;
};

// Delete task from Supabase
export async function deleteTaskFromSupabase(taskId: string) {
  const supabase = createClientComponentClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found");
    return false;
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }

  console.log("Task deleted successfully:", taskId);
  return true;
}

// Delete a task (updated to use Supabase)
export const deleteTask = async (taskId: string): Promise<Task[]> => {
  // Delete from Supabase
  const success = await deleteTaskFromSupabase(taskId);

  if (!success) {
    // If Supabase delete fails, fall back to localStorage for now
    const tasks = loadTasks();
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    saveTasks(updatedTasks);
    return updatedTasks;
  }

  // If Supabase delete succeeds, fetch updated tasks from database
  const updatedTasks = await fetchTasks();
  return updatedTasks;
};

// Reorder tasks
export const reorderTasks = (tasks: Task[]): Task[] => {
  // Ensure all tasks have an order property
  const tasksWithOrder = tasks.map((task, index) => ({
    ...task,
    order: task.order !== undefined ? task.order : index,
  }));

  saveTasks(tasksWithOrder);
  return tasksWithOrder;
};

// Update task order after drag and drop
export const updateTaskOrder = (
  dateStr: string,
  newOrder: string[]
): Task[] => {
  const tasks = loadTasks();

  // Get tasks for the current date and other dates separately
  const tasksForDate = tasks.filter((task) => task.date === dateStr);
  const otherTasks = tasks.filter((task) => task.date !== dateStr);

  // Create a map of task IDs to their new order
  const orderMap = newOrder.reduce((map, id, index) => {
    map[id] = index;
    return map;
  }, {} as Record<string, number>);

  // Update the order of tasks for the current date
  const updatedDateTasks = tasksForDate.map((task) => ({
    ...task,
    order:
      orderMap[task.id] !== undefined ? orderMap[task.id] : task.order || 0,
  }));

  // Merge and save all tasks
  const allUpdatedTasks = [...otherTasks, ...updatedDateTasks];
  saveTasks(allUpdatedTasks);
  return allUpdatedTasks;
};

// Fetch tasks from Supabase
export async function fetchTasks() {
  const supabase = createClientComponentClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("No session found");
    return [];
  }

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", session.user.id)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  // console.log("Fetched tasks:", tasks);

  return tasks.map((task: any) => ({
    id: task.id,
    featureName: task.feature_name,
    description: task.description,
    status: task.status as TaskStatus,
    date: task.date,
    createdAt: task.created_at,
    order: task.order_index,
    priority: task.priority,
    estimatedHours: task.estimated_hours,
    estimatedMinutes: task.estimated_minutes,
    startedAt: task.started_at,
  }));
}

// Calculate the next order for a task on a specific date
export async function calculateNextOrder(date: string): Promise<number> {
  const supabase = createClientComponentClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    console.log("No session found");
    return 0;
  }

  // Get the highest order for tasks on the same date
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("order_index")
    .eq("user_id", session.user.id)
    .eq("date", date)
    .order("order_index", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching tasks for order calculation:", error);
    return 0;
  }

  // If no tasks exist for this date, start with 0
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  // Return the highest order + 1
  return (tasks[0].order_index || 0) + 1;
}

// Create task in Supabase
export async function createTaskInSupabase(task: Task) {
  const supabase = createClientComponentClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found");
    return null;
  }

  // Calculate the next order for this date
  const nextOrder = await calculateNextOrder(task.date);

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: user.id,
        feature_name: task.featureName,
        description: task.description,
        status: task.status,
        date: task.date,
        created_at: task.createdAt,
        order_index: nextOrder,
        priority: task.priority,
        estimated_hours: task.estimatedHours,
        estimated_minutes: task.estimatedMinutes,
        started_at: task.startedAt,
      },
    ])
    .select()
    .single();

  console.log("Created task:", data);

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  // Convert the response back to our Task format
  return {
    id: data.id,
    featureName: data.feature_name,
    description: data.description,
    status: data.status as TaskStatus,
    date: data.date,
    createdAt: data.created_at,
    order: data.order_index,
    priority: data.priority,
    estimatedHours: data.estimated_hours,
    estimatedMinutes: data.estimated_minutes,
    startedAt: data.started_at,
  };
}

// Update a task in Supabase
export async function updateTaskInSupabase(
  taskId: string,
  updates: Partial<Task>
): Promise<Task[]> {
  const supabase = createClientComponentClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("No user found");
    return [];
  }

  // Prepare the update object for Supabase column names
  const updateObj: any = {};
  if (updates.featureName !== undefined)
    updateObj.feature_name = updates.featureName;
  if (updates.description !== undefined)
    updateObj.description = updates.description;
  if (updates.status !== undefined) updateObj.status = updates.status;
  if (updates.date !== undefined) updateObj.date = updates.date;
  if (updates.priority !== undefined) updateObj.priority = updates.priority;
  if (updates.estimatedHours !== undefined)
    updateObj.estimated_hours = updates.estimatedHours;
  if (updates.estimatedMinutes !== undefined)
    updateObj.estimated_minutes = updates.estimatedMinutes;
  if (updates.startedAt !== undefined) updateObj.started_at = updates.startedAt;
  if (updates.order !== undefined) updateObj.order_index = updates.order;

  const { error } = await supabase
    .from("tasks")
    .update(updateObj)
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating task:", error);
    return [];
  }

  // Return the updated list of tasks
  return await fetchTasks();
}
