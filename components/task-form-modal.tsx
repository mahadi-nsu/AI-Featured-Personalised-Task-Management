import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "./ui/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Task, TaskPriority } from "@/lib/utils";
import { Tag, Clock } from "lucide-react";

interface TaskFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues?: Partial<Task>;
  onSubmit: (values: {
    featureName: string;
    description: string;
    priority: TaskPriority;
    estimatedHours: number;
    estimatedMinutes: number;
  }) => Promise<void> | void;
  onClose: () => void;
}

export function TaskFormModal({
  open,
  mode,
  initialValues = {},
  onSubmit,
  onClose,
}: TaskFormModalProps) {
  const [featureName, setFeatureName] = useState(
    initialValues.featureName || ""
  );
  const [description, setDescription] = useState(
    initialValues.description || ""
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues.priority || TaskPriority.LOW
  );
  const [estimatedHours, setEstimatedHours] = useState(
    initialValues.estimatedHours || 0
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialValues.estimatedMinutes || 0
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setFeatureName(initialValues.featureName || "");
      setDescription(initialValues.description || "");
      setPriority(initialValues.priority || TaskPriority.LOW);
      setEstimatedHours(initialValues.estimatedHours || 0);
      setEstimatedMinutes(initialValues.estimatedMinutes || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({
      featureName,
      description,
      priority,
      estimatedHours,
      estimatedMinutes,
    });
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="featureName"
                placeholder="Feature/Bug Name..."
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Task description..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Priority:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      priority === TaskPriority.HIGH ? "default" : "outline"
                    }
                    className={
                      priority === TaskPriority.HIGH
                        ? "bg-red-500 hover:bg-red-600"
                        : ""
                    }
                    onClick={() => setPriority(TaskPriority.HIGH)}
                  >
                    High
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      priority === TaskPriority.MEDIUM ? "default" : "outline"
                    }
                    className={
                      priority === TaskPriority.MEDIUM
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : ""
                    }
                    onClick={() => setPriority(TaskPriority.MEDIUM)}
                  >
                    Medium
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={
                      priority === TaskPriority.LOW ? "default" : "outline"
                    }
                    className={
                      priority === TaskPriority.LOW
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                    onClick={() => setPriority(TaskPriority.LOW)}
                  >
                    Low
                  </Button>
                  {priority && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setPriority(TaskPriority.LOW)}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Estimated Time:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      value={estimatedHours}
                      onChange={(e) =>
                        setEstimatedHours(parseInt(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                    <span className="text-sm whitespace-nowrap">hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={estimatedMinutes}
                      onChange={(e) =>
                        setEstimatedMinutes(parseInt(e.target.value) || 0)
                      }
                      className="w-20"
                    />
                    <span className="text-sm whitespace-nowrap">minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {mode === "edit" ? "Save Changes" : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
