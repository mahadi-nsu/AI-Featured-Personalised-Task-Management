"use client";

import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dummyRoutines, type Routine } from "./dummy-data";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>(dummyRoutines);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSetActive = (routine: Routine) => {
    setSelectedRoutine(routine);
    setIsConfirmModalOpen(true);
  };

  const confirmSetActive = () => {
    if (selectedRoutine) {
      setRoutines((prevRoutines) =>
        prevRoutines.map((routine) => ({
          ...routine,
          isActive: routine.id === selectedRoutine.id,
        }))
      );
      toast.success(`${selectedRoutine.name} is now your active routine`);
    }
    setIsConfirmModalOpen(false);
    setSelectedRoutine(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Routines</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your daily routines and templates
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Routine
        </Button>
      </div>

      {/* Active Routine Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Routine</h2>
        <div className="grid grid-cols-1 gap-4">
          {routines
            .filter((routine) => routine.isActive)
            .map((routine) => (
              <Card key={routine.id} className="border-2 border-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{routine.name}</CardTitle>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <CardDescription>
                    Last updated {format(routine.updatedAt, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {routine.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {item.activityName}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-muted-foreground">
                          {item.plannedDuration} mins
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Templates Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Templates</h2>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {routines
            .filter((routine) => routine.isTemplate)
            .map((template) => (
              <Card
                key={template.id}
                className="min-w-[300px] cursor-pointer hover:border-purple-500/50 transition-colors bg-purple-50/50 dark:bg-purple-950/20"
                onClick={() => handleSetActive(template)}
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    Created on {format(template.createdAt, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{item.activityName}</span>
                        <span className="text-muted-foreground">
                          {item.plannedDuration} mins
                        </span>
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{template.items.length - 3} more activities
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Other Routines Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Routines</h2>
        <div className="flex overflow-x-auto gap-4 pb-4">
          {routines
            .filter((routine) => !routine.isTemplate && !routine.isActive)
            .map((routine) => (
              <Card
                key={routine.id}
                className="min-w-[300px] cursor-pointer hover:border-blue-500/50 transition-colors bg-blue-50/50 dark:bg-blue-950/20"
                onClick={() => handleSetActive(routine)}
              >
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>
                    Last updated {format(routine.updatedAt, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {routine.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>{item.activityName}</span>
                        <span className="text-muted-foreground">
                          {item.plannedDuration} mins
                        </span>
                      </div>
                    ))}
                    {routine.items.length > 3 && (
                      <div className="text-sm text-muted-foreground">
                        +{routine.items.length - 3} more activities
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Active Routine</DialogTitle>
            <DialogDescription>
              Are you sure you want to set "{selectedRoutine?.name}" as your
              active routine? This will replace your current active routine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSetActive}>Set as Active</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
