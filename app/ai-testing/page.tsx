"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompletedTasks } from "../components/completed-tasks";

export default function AITestingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Testing</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
          <CompletedTasks />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">All Tasks</h2>
          <div className="text-muted-foreground">
            Right side content is temporarily hidden
          </div>
        </div>
      </div>
    </div>
  );
}
