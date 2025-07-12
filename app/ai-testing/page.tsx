"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useState } from "react";
import { CompletedTasks } from "@/components/completed-tasks";
import { TestCases } from "@/components/test-cases";
import { Card, WarningNote, DateSelector } from "./components";
import { useTestCases } from "./hooks/useTestCases";

export const dynamic = "force-dynamic";

export default function AITestingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const { testCases, loadedTaskId, isLoading, handleGenerateTestCase } =
    useTestCases();
  const today = new Date();

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI Generated Test Cases</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Note:</span> Test cases are generated
          only for completed tasks
        </p>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="today">Today&apos;s Tasks</TabsTrigger>
          <TabsTrigger value="byDate">Tasks by Date</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={`Completed Tasks (${format(today, "MMM dd, yyyy")})`}>
              <CompletedTasks
                selectedDate={today}
                onGenerateTest={handleGenerateTestCase}
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </Card>
            <Card title="Test Cases">
              <WarningNote />
              <TestCases scenarios={testCases} isLoading={isLoading} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="byDate" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Completed Tasks</h2>
                <DateSelector date={date} onDateChange={setDate} />
              </div>
              <CompletedTasks
                selectedDate={date}
                onGenerateTest={handleGenerateTestCase}
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </div>
            <Card title="Test Cases">
              <WarningNote />
              <TestCases scenarios={testCases} isLoading={isLoading} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
