"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompletedTasks } from "../components/completed-tasks";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, ReactNode } from "react";
import { TestCases } from "../components/test-cases";

interface CardProps {
  title: string;
  children: ReactNode;
}

interface TestCase {
  id: string;
  description: string;
  inputData: string;
  expected: string;
}

export default function AITestingPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState<string | null>(null);
  const today = new Date();

  const handleGenerateTestCase = async (
    featureName: string,
    description: string,
    taskId: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5001/generate-test-cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            featureName,
            description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate test cases");
      }

      const data = await response.json();
      setTestCases(data.scenarios);
      setLoadedTaskId(taskId);
    } catch (error) {
      console.error("Error generating test cases:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const Card = ({ title, children }: CardProps) => (
    <div className="border rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">AI Testing</h1>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="today">Today&apos;s Tasks</TabsTrigger>
          <TabsTrigger value="byDate">Tasks by Date</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Completed Tasks">
              <CompletedTasks
                selectedDate={today}
                onGenerateTest={handleGenerateTestCase}
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </Card>
            <Card title="Test Cases">
              <TestCases scenarios={testCases} isLoading={isLoading} />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="byDate" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Completed Tasks</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => newDate && setDate(newDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <CompletedTasks
                selectedDate={date}
                onGenerateTest={handleGenerateTestCase}
                loadedTaskId={loadedTaskId}
                isLoading={isLoading}
              />
            </div>
            <Card title="Test Cases">
              <TestCases scenarios={testCases} isLoading={isLoading} />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
