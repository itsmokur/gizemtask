"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BoardColumn, Ticket } from "@/types";
import { TicketCard } from "./TicketCard";
import { AddTicketForm } from "./AddTicketForm";

interface KanbanColumnProps {
  column: BoardColumn;
  workspaceId: string;
  sprintId: string;
}

const COLUMN_COLORS: Record<string, string> = {
  todo: "border-t-zinc-500",
  inprogress: "border-t-blue-500",
  done: "border-t-emerald-500",
};

export function KanbanColumn({
  column,
  workspaceId,
  sprintId,
}: KanbanColumnProps) {
  const [addingTicket, setAddingTicket] = useState(false);

  // Make the column itself a drop target (so cards can be dropped on empty columns)
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const ticketIds = column.tickets.map((t: Ticket) => t.id);

  return (
    <div
      className={`
        flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl
        border-t-2 ${COLUMN_COLORS[column.id]} min-w-[280px] w-72
        ${isOver ? "bg-zinc-800/60" : ""}
        transition-colors
      `}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-zinc-200">{column.title}</h3>
          <span className="text-xs bg-zinc-700 text-zinc-400 rounded-full px-2 py-0.5">
            {column.tickets.length}
          </span>
        </div>
        <button
          onClick={() => setAddingTicket(true)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          title="Add ticket"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Ticket list */}
      <div
        ref={setNodeRef}
        className="flex-1 p-3 space-y-2 min-h-[120px] overflow-y-auto"
      >
        <SortableContext items={ticketIds} strategy={verticalListSortingStrategy}>
          {column.tickets.map((ticket: Ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              workspaceId={workspaceId}
              sprintId={sprintId}
            />
          ))}
        </SortableContext>

        {column.tickets.length === 0 && !addingTicket && (
          <div className="flex items-center justify-center h-20 text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
            Drop tickets here
          </div>
        )}

        {/* Inline add form */}
        {addingTicket && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <AddTicketForm
              workspaceId={workspaceId}
              sprintId={sprintId}
              currentCount={column.tickets.length}
              onAdded={() => setAddingTicket(false)}
              onCancel={() => setAddingTicket(false)}
            />
          </div>
        )}
      </div>

      {/* Footer add button */}
      {!addingTicket && (
        <button
          onClick={() => setAddingTicket(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors rounded-b-xl border-t border-zinc-800"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add ticket
        </button>
      )}
    </div>
  );
}
