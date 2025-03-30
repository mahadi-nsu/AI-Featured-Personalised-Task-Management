"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Task, TaskStatus } from "@/lib/utils";
import { loadTasks } from "@/lib/taskStorage";
import { Tag, Clock } from "lucide-react";

export function CompletedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadedTasks = loadTasks();
    const completedTasks = loadedTasks.filter(
      (task) => task.status === TaskStatus.DONE
    );
    setTasks(completedTasks);
  }, []);

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <Card className="p-4">
          <p className="text-muted-foreground">No completed tasks yet.</p>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base text-primary line-through">
                {task.featureName}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {task.description}
              </span>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
