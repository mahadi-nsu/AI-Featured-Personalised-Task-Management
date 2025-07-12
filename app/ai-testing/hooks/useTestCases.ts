import { useState } from "react";
import { TestCase } from "../types/testCaseTypes";
import { useGenerateTestCasesApi } from "../api/useGenerateTestCasesApi";

export const useTestCases = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loadedTaskId, setLoadedTaskId] = useState<string | null>(null);
  const { generateTestCases, isLoading } = useGenerateTestCasesApi();

  const handleGenerateTestCase = async (
    featureName: string,
    description: string,
    taskId: string
  ) => {
    const scenarios = await generateTestCases({ featureName, description });
    setTestCases(scenarios);
    setLoadedTaskId(taskId);
  };

  return {
    testCases,
    loadedTaskId,
    isLoading,
    handleGenerateTestCase,
  };
};
