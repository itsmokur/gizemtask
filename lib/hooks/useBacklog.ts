"use client";

import { useState, useEffect, useCallback } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { BacklogItem } from "@/types";
import {
  subscribeToBacklog,
  batchUpdateBacklogOrder,
} from "@/lib/firebase/backlog";

export function useBacklog(workspaceId: string) {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time backlog updates
  useEffect(() => {
    const unsubscribe = subscribeToBacklog(workspaceId, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [workspaceId]);

  // Handle drag end — reorder backlog items
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);

      // Optimistic update
      setItems(reordered);

      // Persist new order to Firestore
      const updates = reordered.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      await batchUpdateBacklogOrder(workspaceId, updates);
    },
    [items, workspaceId]
  );

  return {
    items,
    loading,
    handleDragEnd,
    setItems,
  };
}
