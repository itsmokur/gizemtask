"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { useState } from "react";
import { Ticket } from "@/types";
import { useBoard } from "@/lib/hooks/useBoard";
import { KanbanColumn } from "./KanbanColumn";
import { PriorityBadge } from "@/components/ui/Badge";

interface KanbanBoardProps {
  workspaceId: string;
  sprintId: string;
}

export function KanbanBoard({ workspaceId, sprintId }: KanbanBoardProps) {
  const { columns, tickets, loading, handleDragOver, handleDragEnd } = useBoard(
    workspaceId,
    sprintId
  );
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500 text-sm animate-pulse">Loading board...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        const ticket = tickets.find((t) => t.id === active.id);
        setActiveTicket(ticket || null);
      }}
      onDragOver={handleDragOver}
      onDragEnd={(e) => {
        setActiveTicket(null);
        handleDragEnd(e);
      }}
      onDragCancel={() => setActiveTicket(null)}
    >
      <div className="flex gap-5 overflow-x-auto pb-4 pt-1 px-1">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            workspaceId={workspaceId}
            sprintId={sprintId}
          />
        ))}
      </div>

      {/* Ghost card shown under cursor while dragging */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeTicket ? (
          <div className="bg-zinc-800 border border-violet-500 rounded-lg p-3 shadow-2xl rotate-1 w-72">
            <p className="text-sm text-zinc-100 font-medium">{activeTicket.title}</p>
            <div className="flex items-center justify-between mt-2">
              <PriorityBadge priority={activeTicket.priority} />
              {activeTicket.storyPoints > 0 && (
                <span className="text-xs text-zinc-500 bg-zinc-700 rounded px-1.5 py-0.5">
                  {activeTicket.storyPoints} pts
                </span>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
