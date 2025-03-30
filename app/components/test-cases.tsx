"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-muted-foreground">No test cases generated yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {scenarios.map((scenario) => (
        <Card key={scenario.id} className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-primary">
                {scenario.id}
              </span>
            </div>
            <h3 className="font-semibold">{scenario.description}</h3>
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Input Data:
                </h4>
                <p className="text-sm mt-1">{scenario.inputData}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Expected Result:
                </h4>
                <p className="text-sm mt-1">{scenario.expected}</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
