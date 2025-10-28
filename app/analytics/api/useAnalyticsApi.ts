import { useState, useEffect } from "react";
import { Task } from "@/lib/utils";
import { fetchTasks } from "@/lib/taskStorage";
import { toast } from "sonner";

export const useAnalyticsApi = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getTasks = async () => {
      setIsLoading(true);
      try {
        const loadedTasks = await fetchTasks();
        setTasks(loadedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        toast.error("Could not load tasks for analytics.");
      } finally {
        setIsLoading(false);
      }
    };
    getTasks();
  }, []);

  return {
    tasks,
    isLoading,
  };
};
