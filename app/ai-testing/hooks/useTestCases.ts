import { useState } from "react";
import { TestCase } from "../types/testCaseTypes";
import { useGenerateTestCasesApi } from "../api/useGenerateTestCasesApi";

export const useTestCases = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadedTaskId, setLoadedTaskId] = useState<string | null>(null);
  const [generatedForDate, setGeneratedForDate] = useState<Date | null>(null);
  const { generateTestCases, isLoading } = useGenerateTestCasesApi();

  const handleGenerateTestCase = async (
    featureName: string,
    description: string,
    taskId: string,
    selectedDate: Date
  ) => {
    const scenarios = await generateTestCases({ featureName, description });
    setTestCases(scenarios);
    setLoadedTaskId(taskId);
    setGeneratedForDate(selectedDate);
  };

  const clearTestCases = () => {
    setTestCases([]);
    setLoadedTaskId(null);
    setGeneratedForDate(null);
  };

  const checkAndClearForNewDate = (currentDate: Date) => {
    if (generatedForDate && !isSameDay(generatedForDate, currentDate)) {
      clearTestCases();
    }
  };

  // Helper function to compare dates (ignoring time)
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  return {
    testCases,
    loadedTaskId,
    isLoading,
    handleGenerateTestCase,
    clearTestCases,
    checkAndClearForNewDate,
  };
};
