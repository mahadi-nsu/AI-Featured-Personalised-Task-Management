import { Card } from "@/components/ui/card";
import { format } from "date-fns";

interface NoDataMessageProps {
  date: Date;
}

export const NoDataMessage = ({ date }: NoDataMessageProps) => (
  <Card className="p-6 text-center text-muted-foreground">
    No tasks found for {format(date, "MMMM d, yyyy")}
  </Card>
);
