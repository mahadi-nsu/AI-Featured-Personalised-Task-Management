import { useState } from "react";
import { toast } from "sonner";
import {
  TestCase,
  GenerateTestCaseParams,
  TestCaseResponse,
} from "../types/testCaseTypes";

export const useGenerateTestCasesApi = () => {
  const [isLoading, setIsLoading] = useState(false);

  const generateTestCases = async (
    params: GenerateTestCaseParams
  ): Promise<TestCase[]> => {
    setIsLoading(true);
    toast.info("Generating test cases", {
      description: `Starting test case generation for "${params.featureName}"...`,
    });

    try {
      const response = await fetch(
        "https://gemini-ai-integration-golang.onrender.com/generate-test-cases",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate test cases");
      }

      const data: TestCaseResponse = await response.json();

      toast.success("Test cases generated", {
        description: `Successfully generated ${data.scenarios.length} test cases for "${params.featureName}".`,
      });

      return data.scenarios;
    } catch (error) {
      console.error("Error generating test cases:", error);
      toast.error("Failed to generate test cases", {
        description:
          "There was an error generating the test cases. Please try again.",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateTestCases,
    isLoading,
  };
};
