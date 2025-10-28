"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { dummyRoutines } from "../dummy-data";

export type RoutineItemRecord = {
  id: string;
  routine_id: string;
  activity_name: string;
  description: string | null;
  planned_duration: number;
  category: string | null;
  time_block: "morning" | "afternoon" | "evening" | null;
  priority: number | null;
};

export type RoutineRecord = {
  id: string;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  is_template: boolean;
  is_active: boolean | null;
  routine_items?: RoutineItemRecord[];
};

type DoneTodayRecord = {
  id: string;
  routine_id: string;
  date: string; // yyyy-mm-dd
  is_done: boolean;
};

function toISODateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function useRoutines() {
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [doneTodayMap, setDoneTodayMap] = useState<Record<string, boolean>>({});
  const [itemDoneTodayMap, setItemDoneTodayMap] = useState<
    Record<string, boolean>
  >({});

  const loadRoutines = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to use a joined select if FK is configured; fallback to separate queries
      const { data, error } = await supabase
        .from("routines")
        .select("*, routine_items(*)")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setRoutines((data || []) as unknown as RoutineRecord[]);
    } catch (err) {
      // Fallback: separate queries if join fails
      try {
        const { data: routinesOnly, error: rErr } = await supabase
          .from("routines")
          .select("*")
          .order("updated_at", { ascending: false });
        if (rErr) throw rErr;
        const { data: itemsOnly } = await supabase
          .from("routine_items")
          .select("*");
        const itemsByRoutine: Record<string, RoutineItemRecord[]> = {};
        (itemsOnly || []).forEach((item: any) => {
          const rid = item.routine_id as string;
          if (!itemsByRoutine[rid]) itemsByRoutine[rid] = [];
          itemsByRoutine[rid].push({
            id: item.id,
            routine_id: item.routine_id,
            activity_name: item.activity_name,
            description: item.description,
            planned_duration: item.planned_duration,
            category: item.category,
            time_block: item.time_block,
            priority: item.priority,
          });
        });
        setRoutines(
          (routinesOnly || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            created_at: r.created_at,
            updated_at: r.updated_at,
            is_template: r.is_template,
            is_active: r.is_active,
            routine_items: itemsByRoutine[r.id] || [],
          }))
        );
      } catch (e) {
        console.error("Failed loading routines", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const seedIfEmpty = useCallback(async () => {
    const { count, error } = await supabase
      .from("routines")
      .select("id", { count: "exact", head: true });
    if (error) {
      console.error("Seed count error", error);
      return;
    }
    if ((count || 0) > 0) return;

    // Insert routines first
    const routinesPayload = dummyRoutines.map((r) => ({
      name: r.name,
      is_template: r.isTemplate,
      is_active: !!r.isActive,
      created_at: r.createdAt.toISOString(),
      updated_at: r.updatedAt.toISOString(),
    }));

    const { data: insertedRoutines, error: insertError } = await supabase
      .from("routines")
      .insert(routinesPayload)
      .select("*");
    if (insertError) {
      console.error("Seed insert routines error", insertError);
      return;
    }

    // Build name->id map since dummy IDs are not DB IDs
    const nameToId: Record<string, string> = {};
    (insertedRoutines || []).forEach((r: any) => {
      nameToId[r.name] = r.id;
    });

    // Insert items
    const itemsPayload: Omit<RoutineItemRecord, "id">[] = [] as any;
    dummyRoutines.forEach((r) => {
      const dbRid = nameToId[r.name];
      if (!dbRid) return;
      r.items.forEach((it) => {
        itemsPayload.push({
          routine_id: dbRid,
          activity_name: it.activityName,
          description: it.description,
          planned_duration: it.plannedDuration,
          category: it.category || null,
          time_block: (it.timeBlock as any) || null,
          priority: it.priority,
        } as any);
      });
    });

    const { error: itemsError } = await supabase
      .from("routine_items")
      .insert(itemsPayload as any);
    if (itemsError) console.error("Seed insert items error", itemsError);

    await loadRoutines();
  }, [supabase, loadRoutines]);

  const setActiveRoutine = useCallback(
    async (routineId: string) => {
      // Deactivate all, then activate one
      const { error: offErr } = await supabase
        .from("routines")
        .update({ is_active: false })
        .eq("is_active", true);
      if (offErr) console.error(offErr);
      const { error } = await supabase
        .from("routines")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", routineId);
      if (error) console.error(error);
      await loadRoutines();
    },
    [supabase, loadRoutines]
  );

  const addItem = useCallback(
    async (
      routineId: string,
      item: {
        activity_name: string;
        description?: string;
        planned_duration: number;
        category?: string;
        time_block?: "morning" | "afternoon" | "evening";
        priority?: number;
      }
    ) => {
      const { error } = await supabase.from("routine_items").insert({
        routine_id: routineId,
        activity_name: item.activity_name,
        description: item.description || null,
        planned_duration: item.planned_duration,
        category: item.category || null,
        time_block: item.time_block || null,
        priority: item.priority ?? null,
      });
      if (error) console.error(error);
      await loadRoutines();
    },
    [supabase, loadRoutines]
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      updates: Partial<
        Pick<
          RoutineItemRecord,
          | "activity_name"
          | "description"
          | "planned_duration"
          | "category"
          | "time_block"
          | "priority"
        >
      >
    ) => {
      const { error } = await supabase
        .from("routine_items")
        .update(updates)
        .eq("id", itemId);
      if (error) console.error(error);
      await loadRoutines();
    },
    [supabase, loadRoutines]
  );

  const getDoneToday = useCallback(
    async (routineId: string, date = new Date()) => {
      const key = `routine_done_${routineId}_${toISODateOnly(date)}`;
      // localStorage fallback
      const ls =
        typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (ls !== null) return ls === "true";
      // Supabase lookup (optional table: routine_daily_status)
      const { data, error } = await supabase
        .from("routine_daily_status")
        .select("is_done")
        .eq("routine_id", routineId)
        .eq("date", toISODateOnly(date))
        .maybeSingle();
      if (error) {
        console.warn("routine_daily_status missing or query failed", error);
        return false;
      }
      return data?.is_done ?? false;
    },
    [supabase]
  );

  const setDoneToday = useCallback(
    async (routineId: string, isDone: boolean, date = new Date()) => {
      const day = toISODateOnly(date);
      // Store local for instant UX and fallback
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `routine_done_${routineId}_${day}`,
          String(isDone)
        );
      }
      setDoneTodayMap((m) => ({ ...m, [`${routineId}:${day}`]: isDone }));
      // Try Supabase upsert into optional table routine_daily_status
      const { error } = await supabase
        .from("routine_daily_status")
        .upsert(
          { routine_id: routineId, date: day, is_done: isDone },
          { onConflict: "routine_id,date" as any }
        );
      if (error) {
        console.warn(
          "routine_daily_status upsert failed (fallback local)",
          error
        );
      }
    },
    [supabase]
  );

  const activeRoutine = useMemo(
    () => routines.find((r) => !!r.is_active) || null,
    [routines]
  );

  const preloadActiveRoutineItemDone = useCallback(async () => {
    const rid = activeRoutine?.id;
    if (!rid) return;
    const today = toISODateOnly(new Date());
    const items = (activeRoutine as any)?.routine_items || [];
    const ids: string[] = items.map((i: any) => i.id).filter(Boolean);
    if (ids.length === 0) return;
    try {
      const { data, error } = await supabase
        .from("routine_item_daily_status")
        .select("item_id,is_done")
        .in("item_id", ids)
        .eq("date", today);
      if (error) throw error;
      const map: Record<string, boolean> = {};
      data?.forEach((row: any) => {
        map[`${row.item_id}:${today}`] = !!row.is_done;
      });
      if (typeof window !== "undefined") {
        ids.forEach((id) => {
          const key = `routine_item_done_${id}_${today}`;
          if (map[`${id}:${today}`] === undefined) {
            const ls = localStorage.getItem(key);
            if (ls !== null) map[`${id}:${today}`] = ls === "true";
          }
        });
      }
      setItemDoneTodayMap((prev) => ({ ...prev, ...map }));
    } catch (e) {
      if (typeof window !== "undefined") {
        const map: Record<string, boolean> = {};
        ids.forEach((id) => {
          const key = `routine_item_done_${id}_${today}`;
          const ls = localStorage.getItem(key);
          if (ls !== null) map[`${id}:${today}`] = ls === "true";
        });
        setItemDoneTodayMap((prev) => ({ ...prev, ...map }));
      }
    }
  }, [activeRoutine, supabase]);

  const setItemDoneToday = useCallback(
    async (itemId: string, isDone: boolean, date = new Date()) => {
      const day = toISODateOnly(date);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `routine_item_done_${itemId}_${day}`,
          String(isDone)
        );
      }
      setItemDoneTodayMap((m) => ({ ...m, [`${itemId}:${day}`]: isDone }));
      const { error } = await supabase
        .from("routine_item_daily_status")
        .upsert(
          { item_id: itemId, date: day, is_done: isDone },
          { onConflict: "item_id,date" as any }
        );
      if (error) {
        console.warn(
          "routine_item_daily_status upsert failed (fallback local)",
          error
        );
      }
    },
    [supabase]
  );

  useEffect(() => {
    (async () => {
      await seedIfEmpty();
      await loadRoutines();
      // preload done map for today
      const today = new Date();
      const rid = activeRoutine?.id;
      if (rid) {
        const done = await getDoneToday(rid, today);
        setDoneTodayMap((m) => ({
          ...m,
          [`${rid}:${toISODateOnly(today)}`]: done,
        }));
      }
      await preloadActiveRoutineItemDone();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    preloadActiveRoutineItemDone();
  }, [preloadActiveRoutineItemDone]);

  return {
    isLoading,
    routines,
    activeRoutine,
    refresh: loadRoutines,
    seedIfEmpty,
    setActiveRoutine,
    addItem,
    updateItem,
    getDoneToday,
    setDoneToday,
    doneTodayMap,
    setItemDoneToday,
    itemDoneTodayMap,
  } as const;
}
