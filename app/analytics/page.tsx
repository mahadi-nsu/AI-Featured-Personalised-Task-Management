"use client";

import { useState } from "react";
import { useAnalytics } from "./hooks/useAnalytics";
import {
  DateSelector,
  TaskDistribution,
  SuccessRate,
  TimeAnalytics,
  PriorityDistribution,
  LoadingSpinner,
  NoDataMessage,
} from "./components";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const {
    dateTasksOnly,
    taskDistribution,
    timeAnalytics,
    priorityDistribution,
    successRate,
    taskDistributionData,
    priorityData,
    timeAnalyticsRadialData,
    isLoading,
  } = useAnalytics(date);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <DateSelector date={date} onDateChange={setDate} />
      </div>

      {dateTasksOnly.length === 0 ? (
        <NoDataMessage date={date} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TaskDistribution
            taskDistributionData={taskDistributionData}
            dateTasksOnly={dateTasksOnly}
            taskDistribution={taskDistribution}
          />
          <SuccessRate
            successRate={successRate}
            dateTasksOnly={dateTasksOnly}
            taskDistribution={taskDistribution}
          />
          <TimeAnalytics
            timeAnalyticsRadialData={timeAnalyticsRadialData}
            timeAnalytics={timeAnalytics}
          />
          <PriorityDistribution
            priorityData={priorityData}
            dateTasksOnly={dateTasksOnly}
            priorityDistribution={priorityDistribution}
          />
        </div>
      )}
    </div>
  );
}
