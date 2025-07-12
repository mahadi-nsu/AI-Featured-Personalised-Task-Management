export interface TestCase {
  id: string;
  description: string;
  inputData: string;
  expected: string;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
}

export interface GenerateTestCaseParams {
  featureName: string;
  description: string;
}

export interface TestCaseResponse {
  scenarios: TestCase[];
}
