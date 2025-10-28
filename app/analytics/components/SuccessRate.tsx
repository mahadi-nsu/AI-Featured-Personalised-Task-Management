import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { COLORS } from "../static/colors";

interface SuccessRateProps {
  successRate: string;
  dateTasksOnly: any[];
  taskDistribution: {
    done: number;
    inProgress: number;
    untouched: number;
  };
}

export const SuccessRate = ({
  successRate,
  dateTasksOnly,
  taskDistribution,
}: SuccessRateProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Success Rate</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circular Progress Chart */}
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Completed", value: taskDistribution.done },
                  {
                    name: "Remaining",
                    value: dateTasksOnly.length - taskDistribution.done,
                  },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
              >
                <Cell fill={COLORS.done} />
                <Cell fill="#e5e7eb" />
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} task${value !== 1 ? "s" : ""}`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Statistics */}
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
            <div className="text-4xl font-bold text-green-500">
              {successRate}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Completion Rate
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-l-2 border-green-500 pl-3">
              <div>
                <div className="text-sm font-medium">Completed Tasks</div>
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

            <div className="flex items-center justify-between border-l-2 border-gray-500 pl-3">
              <div>
                <div className="text-sm font-medium">Remaining Tasks</div>
                <div className="text-xs text-muted-foreground">
                  {(
                    ((dateTasksOnly.length - taskDistribution.done) /
                      dateTasksOnly.length) *
                    100
                  ).toFixed(1)}
                  % of total
                </div>
              </div>
              <div className="text-lg font-semibold text-gray-500">
                {dateTasksOnly.length - taskDistribution.done}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="text-sm text-muted-foreground">
              Total Tasks: {dateTasksOnly.length}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
