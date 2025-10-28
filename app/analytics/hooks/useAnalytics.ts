import { useState, useEffect } from "react";
import { Task } from "@/lib/utils";
import { useAnalyticsApi } from "../api/useAnalyticsApi";
import {
  filterTasksByDate,
  calculateTaskDistribution,
  calculateTimeAnalytics,
  calculatePriorityDistribution,
  calculateSuccessRate,
  createTaskDistributionData,
  createPriorityData,
  createTimeAnalyticsData,
  createTimeAnalyticsRadialData,
} from "../util/analyticsUtils";
import {
  TaskDistribution,
  TimeAnalytics,
  PriorityDistribution,
  ChartData,
  TimeAnalyticsData,
  TimeAnalyticsRadialData,
} from "../types/analyticsTypes";

export const useAnalytics = (selectedDate: Date) => {
  const { tasks, isLoading } = useAnalyticsApi();
  const [dateTasksOnly, setDateTasksOnly] = useState<Task[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<TaskDistribution>({
    done: 0,
    inProgress: 0,
    untouched: 0,
  });
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics>({
    totalEstimatedTime: 0,
    completedTasksTime: 0,
    inProgressTime: 0,
  });
  const [priorityDistribution, setPriorityDistribution] =
    useState<PriorityDistribution>({
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
    });
  const [successRate, setSuccessRate] = useState("0");

  // Chart data
  const [taskDistributionData, setTaskDistributionData] = useState<ChartData[]>(
    []
  );
  const [priorityData, setPriorityData] = useState<ChartData[]>([]);
  const [timeAnalyticsData, setTimeAnalyticsData] = useState<
    TimeAnalyticsData[]
  >([]);
  const [timeAnalyticsRadialData, setTimeAnalyticsRadialData] = useState<
    TimeAnalyticsRadialData[]
  >([]);

  useEffect(() => {
    if (!isLoading) {
      const filteredTasks = filterTasksByDate(tasks, selectedDate);
      setDateTasksOnly(filteredTasks);

      const distribution = calculateTaskDistribution(filteredTasks);
      setTaskDistribution(distribution);

      const timeAnalyticsData = calculateTimeAnalytics(filteredTasks);
      setTimeAnalytics(timeAnalyticsData);

      const priorityData = calculatePriorityDistribution(filteredTasks);
      setPriorityDistribution(priorityData);

      const successRateValue = calculateSuccessRate(
        filteredTasks,
        distribution
      );
      setSuccessRate(successRateValue);

      // Update chart data
      setTaskDistributionData(createTaskDistributionData(distribution));
      setPriorityData(createPriorityData(priorityData));
      setTimeAnalyticsData(createTimeAnalyticsData(timeAnalyticsData));
      setTimeAnalyticsRadialData(
        createTimeAnalyticsRadialData(timeAnalyticsData)
      );
    }
  }, [tasks, selectedDate, isLoading]);

  return {
    tasks,
    dateTasksOnly,
    taskDistribution,
    timeAnalytics,
    priorityDistribution,
    successRate,
    taskDistributionData,
    priorityData,
    timeAnalyticsData,
    timeAnalyticsRadialData,
    isLoading,
  };
};
