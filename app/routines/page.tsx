"use client";

import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
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
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Trash2, Edit } from "lucide-react";

export const dynamic = "force-dynamic";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Initialize routines from localStorage or dummy data
  useEffect(() => {
    const savedRoutines = localStorage.getItem("routines");
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines));
    } else {
      setRoutines(dummyRoutines);
    }
  }, []);

  // Save routines to localStorage whenever they change
  useEffect(() => {
    if (routines.length > 0) {
      localStorage.setItem("routines", JSON.stringify(routines));
    }
  }, [routines]);

  const handleSetActive = (routine: Routine) => {
    setSelectedRoutineId(routine.id);
    setIsConfirmModalOpen(true);
  };

  const confirmSetActive = () => {
    if (selectedRoutineId) {
      const updatedRoutines = routines.map((routine) => ({
        ...routine,
        isActive: routine.id === selectedRoutineId,
      }));
      setRoutines(updatedRoutines);
      const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
      toast.success(`${selectedRoutine?.name} is now your active routine`);
      setSelectedRoutineId(null);
    }
    setIsConfirmModalOpen(false);
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setSelectedRoutineId(null);
  };

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId);
  const activeRoutine = routines.find((r) => r.isActive);

  const isRoutineSelected = (routineId: string) => {
    const isCurrentlySelected = selectedRoutineId === routineId;
    const isCurrentlyActive = routines.find(
      (r) => r.id === routineId
    )?.isActive;
    return isCurrentlySelected || isCurrentlyActive;
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
        <div className="flex overflow-x-auto gap-6 pb-4">
          {routines
            .filter((routine) => routine.isTemplate)
            .map((template) => (
              <Card
                key={template.id}
                className={`min-w-[420px] cursor-pointer transition-all hover:shadow-md ${
                  isRoutineSelected(template.id)
                    ? "border-2 border-green-500"
                    : "hover:border-purple-500/50"
                }`}
                onClick={() => handleSetActive(template)}
              >
                <CardHeader className="bg-purple-50/50 dark:bg-purple-950/20 border-b">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Created on {format(template.createdAt, "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    {isRoutineSelected(template.id) && (
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="bg-white dark:bg-slate-950 pt-4">
                  <div className="space-y-3">
                    {template.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-medium">
                            {item.activityName}
                          </span>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-muted-foreground font-medium ml-4">
                          {item.plannedDuration} mins
                        </span>
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2 pb-1">
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
        <div className="flex overflow-x-auto gap-6 pb-4">
          {routines
            .filter((routine) => !routine.isTemplate && !routine.isActive)
            .map((routine) => (
              <Card
                key={routine.id}
                className={`min-w-[420px] cursor-pointer transition-all hover:shadow-md ${
                  isRoutineSelected(routine.id)
                    ? "border-2 border-green-500"
                    : "hover:border-blue-500/50"
                }`}
                onClick={() => handleSetActive(routine)}
              >
                <CardHeader className="bg-blue-50/50 dark:bg-blue-950/20 border-b">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{routine.name}</CardTitle>
                      <CardDescription className="text-sm">
                        Last updated {format(routine.updatedAt, "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    {isRoutineSelected(routine.id) && (
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="bg-white dark:bg-slate-950 pt-4">
                  <div className="space-y-3">
                    {routine.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="font-medium">
                            {item.activityName}
                          </span>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-muted-foreground font-medium ml-4">
                          {item.plannedDuration} mins
                        </span>
                      </div>
                    ))}
                    {routine.items.length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2 pb-1">
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
      <Dialog open={isConfirmModalOpen} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Active Routine</DialogTitle>
            <DialogDescription>
              Are you sure you want to set &quot;{selectedRoutine?.name}&quot;
              as your active routine? This will replace your current active
              routine.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={confirmSetActive}>Set as Active</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
