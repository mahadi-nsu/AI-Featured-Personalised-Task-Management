"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { CompletedTasks } from "@/components/completed-tasks";
import { TestCases } from "@/components/test-cases";
import { Card, WarningNote, DateSelector, ClearButton } from "./components";
import { useTestCases } from "./hooks/useTestCases";

export const dynamic = "force-dynamic";

export default function AITestingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("today");
  const [previousTab, setPreviousTab] = useState<string | null>(null);
  const {
    testCases,
    loadedTaskId,
    isLoading,
    handleGenerateTestCase,
    clearTestCases,
    checkAndClearForNewDate,
  } = useTestCases();
  const today = new Date();

  // Check and clear test cases when date changes
  useEffect(() => {
    checkAndClearForNewDate(date);
  }, [date, checkAndClearForNewDate]);

  // Check and clear test cases when switching tabs with different dates
  useEffect(() => {
    const currentDate = activeTab === "today" ? today : date;
    checkAndClearForNewDate(currentDate);
  }, [activeTab, today, date, checkAndClearForNewDate]);

  // Reset date to today when switching to "Tasks by Date" tab
  useEffect(() => {
    if (activeTab === "byDate" && previousTab !== "byDate") {
      setDate(today);
    }
    setPreviousTab(activeTab);
  }, [activeTab, previousTab, today]);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">AI Generated Test Cases</h1>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">Note:</span> Test cases are generated
          only for completed tasks
        </p>
      </div>

      <Tabs
        defaultValue="today"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="today">Today&apos;s Tasks</TabsTrigger>
          <TabsTrigger value="byDate">Tasks by Date</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={`Completed Tasks (${format(today, "MMM dd, yyyy")})`}>
              <CompletedTasks
                selectedDate={today}
                onGenerateTest={(featureName, description, taskId) =>
                  handleGenerateTestCase(
                    featureName,
                    description,
                    taskId,
                    today
                  )
                }
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </Card>
            <Card title="Test Cases">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <ClearButton
                  onClear={clearTestCases}
                  disabled={testCases.length === 0}
                />
              </div>
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
                onGenerateTest={(featureName, description, taskId) =>
                  handleGenerateTestCase(featureName, description, taskId, date)
                }
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </div>
            <Card title="Test Cases">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <ClearButton
                  onClear={clearTestCases}
                  disabled={testCases.length === 0}
                />
              </div>
              <WarningNote />
              <TestCases scenarios={testCases} isLoading={isLoading} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
