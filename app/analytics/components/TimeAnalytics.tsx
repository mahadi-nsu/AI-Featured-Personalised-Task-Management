import { Card } from "@/components/ui/card";
import {
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TimeAnalyticsRadialData } from "../types/analyticsTypes";
import { formatTime } from "../util/analyticsUtils";

interface TimeAnalyticsProps {
  timeAnalyticsRadialData: TimeAnalyticsRadialData[];
  timeAnalytics: {
    totalEstimatedTime: number;
    completedTasksTime: number;
    inProgressTime: number;
  };
}

export const TimeAnalytics = ({
  timeAnalyticsRadialData,
  timeAnalytics,
}: TimeAnalyticsProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Time Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radial Bar Chart */}
        <div className="h-[300px] flex flex-col">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={timeAnalyticsRadialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar background dataKey="value" label={false} />
              <Tooltip
                formatter={(value: number) => [
                  `${Math.floor(value / 60)}h ${value % 60}m`,
                  "Time",
                ]}
                contentStyle={{
                  backgroundColor: "#FDF6E9",
                  border: "1px solid #E6D5B8",
                  color: "#8B4513",
                  borderRadius: "var(--radius)",
                  boxShadow:
                    "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  color: "#8B4513",
                  fontWeight: 500,
                }}
              />
              <Legend />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Time Statistics */}
        <div className="space-y-6">
          {/* Total Time */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">
              Total Estimated Time
            </div>
            <div className="text-2xl font-semibold">
              {formatTime(timeAnalytics.totalEstimatedTime)}
            </div>
          </div>

          {/* Time Breakdown */}
          <div className="space-y-3">
            {/* Completed Time */}
            <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
              <div>
                <div className="text-sm font-medium">Completed</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (timeAnalytics.completedTasksTime /
                      timeAnalytics.totalEstimatedTime) *
                    100
                  ).toFixed(1)}
                  % of total time
                </div>
              </div>
              <div className="text-lg font-semibold text-green-500">
                {formatTime(timeAnalytics.completedTasksTime)}
              </div>
            </div>

            {/* In Progress Time */}
            <div className="flex items-center justify-between border-l-2 border-blue-500 pl-3">
              <div>
                <div className="text-sm font-medium">In Progress</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (timeAnalytics.inProgressTime /
                      timeAnalytics.totalEstimatedTime) *
                    100
                  ).toFixed(1)}
                  % of total time
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-500">
                {formatTime(timeAnalytics.inProgressTime)}
              </div>
            </div>

            {/* Remaining Time */}
            <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
              <div>
                <div className="text-sm font-medium">Remaining</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    ((timeAnalytics.totalEstimatedTime -
                      (timeAnalytics.completedTasksTime +
                        timeAnalytics.inProgressTime)) /
                      timeAnalytics.totalEstimatedTime) *
                    100
                  ).toFixed(1)}
                  % of total time
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-500">
                {formatTime(
                  timeAnalytics.totalEstimatedTime -
                    (timeAnalytics.completedTasksTime +
                      timeAnalytics.inProgressTime)
                )}
              </div>
            </div>
          </div>

          {/* Time Completion Rate */}
          <div className="pt-4 mt-4 border-t">
            <div className="text-sm font-medium mb-3">Time Completion Rate</div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
              <div className="text-2xl font-semibold text-green-500">
                {(
                  (timeAnalytics.completedTasksTime /
                    timeAnalytics.totalEstimatedTime) *
                  100
                ).toFixed(1)}
                %
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(timeAnalytics.completedTasksTime)} of{" "}
                {formatTime(timeAnalytics.totalEstimatedTime)} completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
