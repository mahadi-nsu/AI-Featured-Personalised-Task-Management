import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartData } from "../types/analyticsTypes";
import { COLORS } from "../static/colors";

interface TaskDistributionProps {
  taskDistributionData: ChartData[];
  dateTasksOnly: any[];
  taskDistribution: {
    done: number;
    inProgress: number;
    untouched: number;
  };
}

export const TaskDistribution = ({
  taskDistributionData,
  dateTasksOnly,
  taskDistribution,
}: TaskDistributionProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Task Distribution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={taskDistributionData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {taskDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Done"
                        ? COLORS.done
                        : entry.name === "In Progress"
                        ? COLORS.inProgress
                        : COLORS.untouched
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Statistics */}
        <div className="space-y-6">
          {/* Total Tasks */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">Total Tasks</div>
            <div className="text-2xl font-semibold">{dateTasksOnly.length}</div>
          </div>

          {/* Status Breakdown */}
          <div className="space-y-3">
            {/* Done Tasks */}
            <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
              <div>
                <div className="text-sm font-medium">Done</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (taskDistribution.done / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-green-500">
                {taskDistribution.done}
              </div>
            </div>

            {/* In Progress Tasks */}
            <div className="flex items-center justify-between border-l-2 border-blue-500 pl-3">
              <div>
                <div className="text-sm font-medium">In Progress</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (taskDistribution.inProgress / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-blue-500">
                {taskDistribution.inProgress}
              </div>
            </div>

            {/* Untouched Tasks */}
            <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
              <div>
                <div className="text-sm font-medium">Untouched</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    (taskDistribution.untouched / dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-500">
                {taskDistribution.untouched}
              </div>
            </div>
          </div>

          {/* Task Completion Rate */}
          <div className="pt-4 mt-4 border-t">
            <div className="text-sm font-medium mb-3">Task Completion Rate</div>
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md">
              <div className="text-2xl font-semibold text-green-500">
                {((taskDistribution.done / dateTasksOnly.length) * 100).toFixed(
                  1
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">
                {taskDistribution.done} of {dateTasksOnly.length} tasks
                completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
