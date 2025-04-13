"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoutineItem {
  id: string;
  activityName: string;
  description: string;
  plannedDuration: number; // in minutes
  category?: string;
  timeBlock?: "morning" | "afternoon" | "evening";
  priority: number;
}

interface Routine {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  items: RoutineItem[];
}

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);

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

      {/* Templates Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines
            .filter((routine) => routine.isTemplate)
            .map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    Created on {template.createdAt.toLocaleDateString()}
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

      {/* Active Routines Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Routines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines
            .filter((routine) => !routine.isTemplate)
            .map((routine) => (
              <Card key={routine.id}>
                <CardHeader>
                  <CardTitle>{routine.name}</CardTitle>
                  <CardDescription>
                    Last updated {routine.updatedAt.toLocaleDateString()}
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
    </div>
  );
}
