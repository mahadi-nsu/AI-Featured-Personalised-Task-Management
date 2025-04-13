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
import { dummyRoutines, type Routine } from "./dummy-data";

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>(dummyRoutines);

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
                    Last updated {routine.updatedAt.toLocaleDateString()}
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

      {/* Other Routines Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Routines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines
            .filter((routine) => !routine.isTemplate && !routine.isActive)
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
