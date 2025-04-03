"use client";

import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, TaskPriority, TaskStatus } from "@/lib/utils";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/create-task-modal";
import { saveTasks, loadTasks } from "@/lib/taskStorage";

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

    if (status === "failed") {
      const testCase = scenarios.find((s) => s.id === scenarioId);
      if (testCase) {
        setSelectedTestCase(testCase);
        setIsCreateTaskModalOpen(true);
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
  };

  const getCardStyle = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-purple-50 border-purple-200";
      case "inappropriate":
        return "bg-gray-100 border-gray-200 opacity-75";
      default:
        return "";
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-200 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Test Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200 gap-1">
            <XCircle className="h-3 w-3" />
            Test Failed
          </Badge>
        );
      case "inappropriate":
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 gap-1">
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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
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
              <h3 className="font-semibold">
                {scenario.description.replace(/<br>/g, "")}
              </h3>
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Input Data / Items to check:
                  </h4>
                  <ul className="list-none space-y-2 pl-4">
                    {formatNumberedText(scenario.inputData).map(
                      (item, index) => (
                        <li key={index} className="text-sm">
                          {item.trim()}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Expected Result:
                  </h4>
                  {hasNumberedFormat(scenario.expected) ? (
                    <ul className="list-none space-y-2 pl-4">
                      {formatNumberedText(scenario.expected).map(
                        (item, index) => (
                          <li key={index} className="text-sm">
                            {item.trim()}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm whitespace-pre-line pl-4">
                      {scenario.expected.replace(/<br>/g, "")}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    className={cn(
                      "flex-1",
                      "bg-green-600 hover:bg-green-700 text-white",
                      testStatuses[scenario.id] === "passed" &&
                        "ring-2 ring-green-600"
                    )}
                    variant="outline"
                    onClick={() => handleStatusChange(scenario.id, "passed")}
                  >
                    Test Passed
                  </Button>
                  <Button
                    className={cn(
                      "flex-1",
                      "bg-purple-600 hover:bg-purple-700 text-white",
                      testStatuses[scenario.id] === "failed" &&
                        "ring-2 ring-purple-600"
                    )}
                    variant="outline"
                    onClick={() => handleStatusChange(scenario.id, "failed")}
                  >
                    Test Failed
                  </Button>
                  <Button
                    className={cn(
                      "flex-1",
                      "bg-gray-900 hover:bg-gray-800 text-white",
                      testStatuses[scenario.id] === "inappropriate" &&
                        "ring-2 ring-gray-900"
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
