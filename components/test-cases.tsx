"use client";

import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, TaskPriority, TaskStatus } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/create-task-modal";
import { saveTasks, loadTasks } from "@/lib/taskStorage";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface TestCase {
  id: string;
  description: string;
  inputData: string;
  expected: string;
}

interface TestCasesProps {
  scenarios: TestCase[];
  isLoading: boolean;
}

type TestStatus = "passed" | "failed" | "inappropriate" | null;

export function TestCases({ scenarios, isLoading }: TestCasesProps) {
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>(
    {}
  );
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

  const formatNumberedText = (text: string) => {
    // Split by numbered items (1., 2., etc.)
    const items = text.split(/(?=\d+\.)/);
    return items
      .filter((item) => item.trim().length > 0)
      .map((item) => item.replace(/<br>/g, "").trim());
  };

  const hasNumberedFormat = (text: string) => {
    // Check if the text contains numbered items (1., 2., etc.)
    return /\d+\./.test(text);
  };

  const handleStatusChange = (scenarioId: string, status: TestStatus) => {
    setTestStatuses((prev) => ({
      ...prev,
      [scenarioId]: status,
    }));

    const testCase = scenarios.find((s) => s.id === scenarioId);
    if (testCase) {
      switch (status) {
        case "passed":
          toast.success("Test marked as passed", {
            description: `Test case "${testCase.description
              .split(".")[0]
              .trim()}" has been marked as passed.`,
          });
          break;
        case "failed":
          toast.info("Creating task from failed test", {
            description: `Opening task creation form for "${testCase.description
              .split(".")[0]
              .trim()}".`,
          });
          setSelectedTestCase(testCase);
          setIsCreateTaskModalOpen(true);
          break;
        case "inappropriate":
          toast.warning("Test marked as inappropriate", {
            description: `Test case "${testCase.description
              .split(".")[0]
              .trim()}" has been marked as inappropriate.`,
          });
          break;
      }
    }
  };

  const handleCreateTask = (task: {
    featureName: string;
    description: string;
    priority: TaskPriority;
    estimatedHours: number;
    estimatedMinutes: number;
  }) => {
    const existingTasks = loadTasks();
    saveTasks([
      ...existingTasks,
      {
        id: crypto.randomUUID(),
        ...task,
        status: TaskStatus.UNTOUCHED,
        date: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        order: 0,
      },
    ]);
    toast.success("Task created from failed test", {
      description: `"${task.featureName}" has been added to your task list.`,
    });
  };

  const getCardStyle = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "failed":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800";
      case "inappropriate":
        return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
      default:
        return "dark:bg-gray-950/50";
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-800 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Test Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-200 dark:hover:bg-purple-800 gap-1">
            <XCircle className="h-3 w-3" />
            Test Failed
          </Badge>
        );
      case "inappropriate":
        return (
          <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-800 gap-1">
            <AlertTriangle className="h-3 w-3" />
            Test Should be avoided
          </Badge>
        );
      default:
        return null;
    }
  };

  const cleanScenarios = scenarios.filter((scenario) => scenario.id !== "---");

  if (isLoading) {
    return (
      <Card className="p-6 flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center gap-2 mb-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg font-semibold text-primary">
            Gemini is thinking...
          </span>
        </div>
        <div className="w-full flex flex-col gap-3 mt-2">
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </Card>
    );
  }

  if (!cleanScenarios || cleanScenarios.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No test cases generated yet.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {cleanScenarios.map((scenario) => (
          <Card
            key={scenario.id}
            className={cn(
              "p-4 transition-all duration-200",
              getCardStyle(testStatuses[scenario.id])
            )}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-primary">
                  {scenario.id}
                </span>
                {getStatusBadge(testStatuses[scenario.id])}
              </div>
              <h3 className="font-semibold text-foreground">
                {scenario.description.replace(/<br>/g, "")}
              </h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-foreground/80 mb-2">
                    Input Data / Items to check:
                  </h4>
                  <ul className="list-none space-y-2 pl-4">
                    {formatNumberedText(scenario.inputData).map(
                      (item, index) => (
                        <li key={index} className="text-sm text-foreground/80">
                          {item.trim()}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground/80 mb-2">
                    Expected Result:
                  </h4>
                  {hasNumberedFormat(scenario.expected) ? (
                    <ul className="list-none space-y-2 pl-4">
                      {formatNumberedText(scenario.expected).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm text-foreground/80"
                          >
                            {item.trim()}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm whitespace-pre-line pl-4 text-foreground/80">
                      {scenario.expected.replace(/<br>/g, "")}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <div className="flex gap-2">
                    <Button
                      className={cn(
                        "flex-1",
                        testStatuses[scenario.id] === "passed"
                          ? "bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800 ring-2 ring-green-600 dark:ring-green-500"
                          : "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-900 dark:text-green-300"
                      )}
                      variant="outline"
                      onClick={() => handleStatusChange(scenario.id, "passed")}
                    >
                      Test Passed
                    </Button>
                    <Button
                      className={cn(
                        "flex-1",
                        testStatuses[scenario.id] === "failed"
                          ? "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 ring-2 ring-purple-600 dark:ring-purple-500"
                          : "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:hover:bg-purple-900 dark:text-purple-300"
                      )}
                      variant="outline"
                      onClick={() => handleStatusChange(scenario.id, "failed")}
                    >
                      Test Failed
                    </Button>
                  </div>
                  <Button
                    className={cn(
                      "w-full sm:w-auto",
                      testStatuses[scenario.id] === "inappropriate"
                        ? "bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-800 ring-2 ring-gray-800 dark:ring-gray-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300"
                    )}
                    variant="outline"
                    onClick={() =>
                      handleStatusChange(scenario.id, "inappropriate")
                    }
                  >
                    Inappropriate test
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTestCase && (
        <CreateTaskModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => {
            setIsCreateTaskModalOpen(false);
            setSelectedTestCase(null);
          }}
          onSubmit={handleCreateTask}
          defaultFeatureName={selectedTestCase.description.split(".")[0].trim()}
          defaultDescription={`Failed Test Case: ${selectedTestCase.description}\n\nExpected Result:\n${selectedTestCase.expected}`}
        />
      )}
    </>
  );
}
