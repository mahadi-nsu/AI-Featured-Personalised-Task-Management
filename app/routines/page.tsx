"use client";

import { Button } from "@/components/ui/button";
import { Plus, Check, Edit } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Routines are loaded from Supabase via hook
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
// no external link used here
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useRoutines,
  type RoutineRecord,
  type RoutineItemRecord,
} from "./hooks/useRoutines";

export const dynamic = "force-dynamic";

export default function RoutinesPage() {
  const {
    routines,
    activeRoutine,
    setActiveRoutine,
    addItem,
    updateItem,
    setDoneToday,
    doneTodayMap,
    setItemDoneToday,
    itemDoneTodayMap,
    isLoading,
  } = useRoutines();
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(
    null
  );
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [targetRoutineId, setTargetRoutineId] = useState<string | null>(null);
  const [form, setForm] = useState({
    activity_name: "",
    description: "",
    planned_duration: 60,
    category: "",
    time_block: "morning" as "morning" | "afternoon" | "evening",
    priority: 1,
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const todayKey = (rid: string) => {
    const day = new Date().toISOString().slice(0, 10);
    return `${rid}:${day}`;
  };

  const handleSetActive = (routine: RoutineRecord) => {
    setSelectedRoutineId(routine.id);
    setIsConfirmModalOpen(true);
  };

  const confirmSetActive = () => {
    if (selectedRoutineId) {
      setActiveRoutine(selectedRoutineId);
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

  const isRoutineSelected = (routineId: string) => {
    const isCurrentlySelected = selectedRoutineId === routineId;
    const found = routines.find((r) => r.id === routineId) as any;
    const isCurrentlyActive = found?.is_active || found?.isActive;
    return isCurrentlySelected || isCurrentlyActive;
  };

  const openAdd = (rid: string) => {
    setTargetRoutineId(rid);
    setForm({
      activity_name: "",
      description: "",
      planned_duration: 60,
      category: "",
      time_block: "morning",
      priority: 1,
    });
    setIsAddOpen(true);
  };

  const openEdit = (rid: string, item: any) => {
    setTargetRoutineId(rid);
    setEditingItemId(item.id);
    setForm({
      activity_name: item.activity_name ?? item.activityName,
      description: item.description || "",
      planned_duration: item.planned_duration ?? item.plannedDuration,
      category: item.category || "",
      time_block: (item.time_block ?? item.timeBlock) || "morning",
      priority: item.priority ?? 1,
    });
    setIsEditOpen(true);
  };

  const submitAdd = async () => {
    if (!targetRoutineId) return;
    try {
      await addItem(targetRoutineId, form);
      setIsAddOpen(false);
      toast.success("Item added to routine");
    } catch (e: any) {
      toast.error(e?.message || "Please provide activity name and description");
    }
  };

  const submitEdit = async () => {
    if (!editingItemId) return;
    try {
      if (!form.activity_name || !form.description) {
        throw new Error("Activity name and description are required");
      }
      await updateItem(editingItemId, form as any);
      setIsEditOpen(false);
      setEditingItemId(null);
      toast.success("Item updated");
    } catch (e: any) {
      toast.error(e?.message || "Please provide activity name and description");
    }
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
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Create New Routine
        </Button>
      </div>

      {/* Active Routine Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Active Routine</h2>
        <div className="grid grid-cols-1 gap-4">
          {routines
            .filter((routine: any) => routine.is_active || routine.isActive)
            .map((routine) => (
              <Card key={routine.id} className="border-2 border-primary">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{routine.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="done-today"
                          checked={
                            !!(
                              activeRoutine &&
                              doneTodayMap[todayKey(activeRoutine.id)]
                            )
                          }
                          onCheckedChange={(v) => {
                            if (activeRoutine) {
                              setDoneToday(activeRoutine.id, Boolean(v));
                            }
                          }}
                        />
                        <label htmlFor="done-today" className="text-xs">
                          Done today
                        </label>
                      </div>
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Last updated{" "}
                    {format(
                      new Date(
                        (routine as any).updated_at ||
                          (routine as any).updatedAt ||
                          (routine as any).created_at ||
                          new Date().toISOString()
                      ),
                      "MMM d, yyyy"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-3">
                    <Button size="sm" onClick={() => openAdd(routine.id)}>
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {(
                      (routine as any).routine_items ||
                      (routine as any).items ||
                      []
                    ).map((item: RoutineItemRecord | any) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4 text-sm p-2 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <span className="font-medium">
                            {(item as any).activity_name ??
                              (item as any).activityName}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <span className="text-muted-foreground text-center justify-self-center">
                          {(item as any).planned_duration ??
                            (item as any).plannedDuration}{" "}
                          mins
                        </span>
                        <div className="flex items-center gap-3 justify-end">
                          <Checkbox
                            id={`item-done-${item.id}`}
                            checked={
                              !!itemDoneTodayMap[
                                `${item.id}:${new Date()
                                  .toISOString()
                                  .slice(0, 10)}`
                              ]
                            }
                            onCheckedChange={(v) =>
                              setItemDoneToday(item.id, Boolean(v))
                            }
                          />
                          <label
                            htmlFor={`item-done-${item.id}`}
                            className="text-xs"
                          >
                            Done
                          </label>
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(routine.id, item as any)}
                            aria-label="Edit item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
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
            .filter((routine: any) => routine.is_template || routine.isTemplate)
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
                        Created on{" "}
                        {format(
                          new Date(
                            (template as any).created_at ||
                              (template as any).createdAt ||
                              new Date().toISOString()
                          ),
                          "MMM d, yyyy"
                        )}
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
                    {(
                      (template as any).routine_items ||
                      (template as any).items ||
                      []
                    )
                      .slice(0, 3)
                      .map((item: RoutineItemRecord | any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="font-medium">
                              {(item as any).activity_name ??
                                (item as any).activityName}
                            </span>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-muted-foreground font-medium ml-4">
                            {(item as any).planned_duration ??
                              (item as any).plannedDuration}{" "}
                            mins
                          </span>
                        </div>
                      ))}
                    {(
                      (template as any).routine_items ||
                      (template as any).items ||
                      []
                    ).length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2 pb-1">
                        +
                        {(
                          (template as any).routine_items ||
                          (template as any).items
                        ).length - 3}{" "}
                        more activities
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
            .filter(
              (routine: any) =>
                !(routine.is_template || routine.isTemplate) &&
                !(routine.is_active || routine.isActive)
            )
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
                        Last updated{" "}
                        {format(
                          new Date(
                            (routine as any).updated_at ||
                              (routine as any).updatedAt ||
                              (routine as any).created_at ||
                              new Date().toISOString()
                          ),
                          "MMM d, yyyy"
                        )}
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
                    {(
                      (routine as any).routine_items ||
                      (routine as any).items ||
                      []
                    )
                      .slice(0, 3)
                      .map((item: RoutineItemRecord | any) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-sm p-3 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <div className="space-y-1">
                            <span className="font-medium">
                              {(item as any).activity_name ??
                                (item as any).activityName}
                            </span>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                          <span className="text-muted-foreground font-medium ml-4">
                            {(item as any).planned_duration ??
                              (item as any).plannedDuration}{" "}
                            mins
                          </span>
                        </div>
                      ))}
                    {(
                      (routine as any).routine_items ||
                      (routine as any).items ||
                      []
                    ).length > 3 && (
                      <div className="text-sm text-muted-foreground text-center pt-2 pb-1">
                        +
                        {(
                          (routine as any).routine_items ||
                          (routine as any).items
                        ).length - 3}{" "}
                        more activities
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
      {/* Add Item Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="activity_name">Activity Name</Label>
              <Input
                id="activity_name"
                value={form.activity_name}
                onChange={(e) =>
                  setForm({ ...form, activity_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="duration">Duration (mins)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={form.planned_duration}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      planned_duration: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time_block">Time</Label>
                <select
                  id="time_block"
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={form.time_block}
                  onChange={(e) =>
                    setForm({ ...form, time_block: e.target.value as any })
                  }
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAdd}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label htmlFor="activity_name_e">Activity Name</Label>
              <Input
                id="activity_name_e"
                value={form.activity_name}
                onChange={(e) =>
                  setForm({ ...form, activity_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="description_e">Description</Label>
              <Textarea
                id="description_e"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="duration_e">Duration (mins)</Label>
                <Input
                  id="duration_e"
                  type="number"
                  value={form.planned_duration}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      planned_duration: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time_block_e">Time</Label>
                <select
                  id="time_block_e"
                  className="w-full h-10 rounded-md border bg-background px-3"
                  value={form.time_block}
                  onChange={(e) =>
                    setForm({ ...form, time_block: e.target.value as any })
                  }
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority_e">Priority</Label>
                <Input
                  id="priority_e"
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category_e">Category</Label>
              <Input
                id="category_e"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
