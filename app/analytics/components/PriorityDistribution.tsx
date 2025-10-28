import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../types/analyticsTypes";
import { COLORS } from "../static/colors";
import { TaskPriority, TaskStatus } from "@/lib/utils";

interface PriorityDistributionProps {
  priorityData: ChartData[];
  dateTasksOnly: any[];
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
    none: number;
  };
}

export const PriorityDistribution = ({
  priorityData,
  dateTasksOnly,
  priorityDistribution,
}: PriorityDistributionProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Priority Distribution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-6">
        {/* Bar Chart */}
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} task${value !== 1 ? "s" : ""}`,
                  `${props.payload.name} Priority`,
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
              <Bar dataKey="value">
                {priorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "High"
                        ? COLORS.high
                        : entry.name === "Medium"
                        ? COLORS.medium
                        : entry.name === "Low"
                        ? COLORS.low
                        : COLORS.none
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Statistics */}
        <div className="space-y-4">
          {/* Total Tasks */}
          <div className="mb-6">
            <div className="text-sm text-muted-foreground">
              Tasks with Priority
            </div>
            <div className="text-2xl font-semibold">
              {dateTasksOnly.length - priorityDistribution.none}
              <span className="text-sm text-muted-foreground ml-2">
                (
                {(
                  ((dateTasksOnly.length - priorityDistribution.none) /
                    dateTasksOnly.length) *
                  100
                ).toFixed(1)}
                %)
              </span>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="space-y-3">
            {/* High Priority */}
            <div className="flex items-center justify-between border-l-2 border-red-500 pl-3">
              <div>
                <div className="text-sm font-medium">High Priority</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (priorityDistribution.high / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-red-500">
                {priorityDistribution.high}
              </div>
            </div>

            {/* Medium Priority */}
            <div className="flex items-center justify-between border-l-2 border-yellow-500 pl-3">
              <div>
                <div className="text-sm font-medium">Medium Priority</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (priorityDistribution.medium / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-yellow-500">
                {priorityDistribution.medium}
              </div>
            </div>

            {/* Low Priority */}
            <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
              <div>
                <div className="text-sm font-medium">Low Priority</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (priorityDistribution.low / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-green-500">
                {priorityDistribution.low}
              </div>
            </div>

            {/* No Priority */}
            <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
              <div>
                <div className="text-sm font-medium">No Priority</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (priorityDistribution.none / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-500">
                {priorityDistribution.none}
              </div>
            </div>
          </div>

          {/* Completion by Priority */}
          <div className="pt-4 mt-4 border-t">
            <div className="text-sm font-medium mb-3">Completion Rate</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded-md">
                <div className="text-red-600 dark:text-red-400 font-medium">
                  High
                </div>
                <div>
                  {(
                    (dateTasksOnly.filter(
                      (t) =>
                        t.priority === TaskPriority.HIGH &&
                        t.status === TaskStatus.DONE
                    ).length /
                      (priorityDistribution.high || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-md">
                <div className="text-yellow-600 dark:text-yellow-400 font-medium">
                  Medium
                </div>
                <div>
                  {(
                    (dateTasksOnly.filter(
                      (t) =>
                        t.priority === TaskPriority.MEDIUM &&
                        t.status === TaskStatus.DONE
                    ).length /
                      (priorityDistribution.medium || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-md">
                <div className="text-green-600 dark:text-green-400 font-medium">
                  Low
                </div>
                <div>
                  {(
                    (dateTasksOnly.filter(
                      (t) =>
                        t.priority === TaskPriority.LOW &&
                        t.status === TaskStatus.DONE
                    ).length /
                      (priorityDistribution.low || 1)) *
                    100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
