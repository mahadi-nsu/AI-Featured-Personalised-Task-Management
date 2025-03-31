"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function TestCases({ scenarios, isLoading }: TestCasesProps) {
  const formatInputData = (inputData: string) => {
    // Split by numbered items (1., 2., etc.)
    const items = inputData.split(/(?=\d+\.)/);
    return items
      .filter((item) => item.trim().length > 0)
      .map((item) => item.replace(/<br>/g, "").trim());
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
    <div className="space-y-4">
      {cleanScenarios.map((scenario) => (
        <Card key={scenario.id} className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-primary">
                {scenario.id}
              </span>
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
                  {formatInputData(scenario.inputData).map((item, index) => (
                    <li key={index} className="text-sm">
                      {item.trim()}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Expected Result:
                </h4>
                <p className="text-sm whitespace-pre-line pl-4">
                  {scenario.expected.replace(/<br>/g, "")}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  className={cn(
                    "flex-1",
                    "bg-green-600 hover:bg-green-700 text-white"
                  )}
                  variant="outline"
                >
                  Test Passed
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    "bg-red-600 hover:bg-red-700 text-white"
                  )}
                  variant="outline"
                >
                  Test Failed
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    "bg-gray-900 hover:bg-gray-800 text-white"
                  )}
                  variant="outline"
                >
                  Inappropriate test
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
