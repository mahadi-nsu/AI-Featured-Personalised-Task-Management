import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ClearButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

export const ClearButton = ({
  onClear,
  disabled = false,
}: ClearButtonProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClear}
    disabled={disabled}
    className="text-red-600 hover:text-red-700 hover:bg-red-50"
  >
    <Trash2 className="h-4 w-4 mr-2" />
    Clear Test Cases
  </Button>
);
