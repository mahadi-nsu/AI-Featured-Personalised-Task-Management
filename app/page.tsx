"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TodaysTasks } from "@/components/todays-tasks";
import { DateTasks } from "@/components/date-tasks";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Task Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage your daily tasks and view tasks by specific dates
        </p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="today">Today&apos;s Tasks</TabsTrigger>
          <TabsTrigger value="byDate">Tasks by Date</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0">
          <TodaysTasks />
        </TabsContent>

        <TabsContent value="byDate" className="mt-0">
          <DateTasks />
        </TabsContent>
      </Tabs>
    </div>
  );
}
