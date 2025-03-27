"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Task } from "@/lib/utils";
import { loadTasks } from "@/lib/taskStorage";

export default function DebugPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [oldTodos, setOldTodos] = useState<any[]>([]);
  const [localStorage, setLocalStorage] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Get all localStorage data
    const allItems: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) {
        allItems[key] = window.localStorage.getItem(key) || "";
      }
    }
    setLocalStorage(allItems);

    // Get tasks using our storage system
    const loadedTasks = loadTasks();
    setTasks(loadedTasks);

    // Get old todos if they exist
    const savedTodos = window.localStorage.getItem("todos");
    if (savedTodos) {
      try {
        setOldTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error("Error parsing old todos:", error);
      }
    }
  }, []);

  const clearLocalStorage = () => {
    if (typeof window === "undefined") return;

    if (confirm("Are you sure you want to clear all localStorage data?")) {
      window.localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Debug Page</h1>

        <div className="mb-4 flex justify-end">
          <Button onClick={clearLocalStorage} variant="destructive">
            Clear All localStorage
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(tasks, null, 2)}
            </pre>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Old Todos</h2>
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(oldTodos, null, 2)}
            </pre>
          </Card>

          <Card className="p-6 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">All localStorage Keys</h2>
            <pre className="text-sm bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(localStorage, null, 2)}
            </pre>
          </Card>
        </div>
      </main>
    </div>
  );
}
