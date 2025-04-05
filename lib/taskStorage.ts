import { Task, TaskStatus, TaskPriority } from "./utils";

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
    let tasks: Task[] = [];

    if (savedTasks) {
      console.log("Loading tasks from localStorage:", savedTasks);
      tasks = JSON.parse(savedTasks);
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

    // If no tasks exist or tasks array is empty, create default tasks
    if (!savedTasks || tasks.length === 0) {
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
    }

    return tasks;
  } catch (error) {
    console.error("Error loading tasks:", error);
    // If there's an error, return default tasks
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
  }
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

// Delete a task
export const deleteTask = (taskId: string): Task[] => {
  const tasks = loadTasks();
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  saveTasks(updatedTasks);
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
