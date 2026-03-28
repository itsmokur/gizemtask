"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Ticket, TicketStatus, BoardColumn } from "@/types";
import {
  subscribeToTickets,
  batchUpdateTicketPositions,
} from "@/lib/firebase/tickets";

const COLUMN_TITLES: Record<TicketStatus, string> = {
  todo: "To Do",
  inprogress: "In Progress",
  done: "Done",
};

export function useBoard(workspaceId: string, sprintId: string | null) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const dragOriginalStatus = useRef<Record<string, TicketStatus>>({});

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sprintId) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToTickets(workspaceId, sprintId, (data) => {
      setTickets(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [workspaceId, sprintId]);

  // Build board columns from flat ticket list
  const columns: BoardColumn[] = (["todo", "inprogress", "done"] as TicketStatus[]).map(
    (status) => ({
      id: status,
      title: COLUMN_TITLES[status],
      tickets: tickets
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order),
    })
  );

  // Handle drag over — optimistic column switch
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) return;

    // Save original status before any optimistic update
    if (!dragOriginalStatus.current[activeId]) {
      dragOriginalStatus.current[activeId] = activeTicket.status;
    }

    // Determine target column
    const targetColumnId = (["todo", "inprogress", "done"] as TicketStatus[]).includes(
      overId as TicketStatus
    )
      ? (overId as TicketStatus)
      : tickets.find((t) => t.id === overId)?.status;

    if (!targetColumnId || activeTicket.status === targetColumnId) return;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) =>
        t.id === activeId ? { ...t, status: targetColumnId } : t
      )
    );
  }, [tickets]);

  // Handle drag end — persist reordering to Firestore
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      if (!sprintId) return;

      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const currentTickets = [...tickets];
      const activeTicket = currentTickets.find((t) => t.id === activeId);
      if (!activeTicket) return;

      // Use original status (before optimistic updates) to detect cross-column moves
      const originalStatus = dragOriginalStatus.current[activeId] || activeTicket.status;
      delete dragOriginalStatus.current[activeId];

      // Determine target column
      const targetStatus = (["todo", "inprogress", "done"] as TicketStatus[]).includes(
        overId as TicketStatus
      )
        ? (overId as TicketStatus)
        : currentTickets.find((t) => t.id === overId)?.status || activeTicket.status;

      // Get tickets in the target column
      const columnTickets = currentTickets
        .filter((t) => t.status === targetStatus)
        .sort((a, b) => a.order - b.order);

      let reordered: Ticket[];

      if (originalStatus === targetStatus) {
        // Same column — just reorder
        const oldIndex = columnTickets.findIndex((t) => t.id === activeId);
        const newIndex = columnTickets.findIndex((t) => t.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
        reordered = arrayMove(columnTickets, oldIndex, newIndex);
      } else {
        // Different column — insert at position
        const overIndex = columnTickets.findIndex((t) => t.id === overId);
        const insertAt = overIndex === -1 ? columnTickets.length : overIndex;
        const withoutActive = columnTickets.filter((t) => t.id !== activeId);
        withoutActive.splice(insertAt, 0, { ...activeTicket, status: targetStatus });
        reordered = withoutActive;
      }

      // Assign new order values
      const updates = reordered.map((t, index) => ({
        id: t.id,
        order: index,
        status: targetStatus,
      }));

      // Optimistic local update
      setTickets((prev) => {
        const withoutColumn = prev.filter((t) => t.status !== targetStatus || t.id === activeId);
        const updatedColumn = reordered.map((t, i) => ({
          ...t,
          status: targetStatus,
          order: i,
        }));
        return [
          ...withoutColumn.filter((t) => t.status !== targetStatus),
          ...updatedColumn,
        ];
      });

      // Persist to Firestore
      await batchUpdateTicketPositions(workspaceId, sprintId, updates);
    },
    [tickets, workspaceId, sprintId]
  );

  const storyPointTotal = tickets.reduce((sum, t) => sum + t.storyPoints, 0);
  const completedPoints = tickets
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.storyPoints, 0);

  return {
    columns,
    tickets,
    loading,
    handleDragOver,
    handleDragEnd,
    storyPointTotal,
    completedPoints,
    setTickets,
  };
}
