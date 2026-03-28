"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ticket } from "@/types";
import { PriorityBadge, LabelBadge } from "@/components/ui/Badge";
import { useState } from "react";
import { TicketDetailModal } from "./TicketDetailModal";

interface TicketCardProps {
  ticket: Ticket;
  workspaceId: string;
  sprintId: string;
}

export function TicketCard({ ticket, workspaceId, sprintId }: TicketCardProps) {
  const [showDetail, setShowDetail] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setShowDetail(true)}
        className={`
          bg-zinc-800 border border-zinc-700 rounded-lg p-3 cursor-grab active:cursor-grabbing
          hover:border-zinc-500 transition-colors select-none
          ${isDragging ? "opacity-40 shadow-2xl ring-2 ring-violet-500" : ""}
        `}
      >
        {/* Labels */}
        {ticket.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {ticket.labels.map((label) => (
              <LabelBadge key={label} label={label} />
            ))}
          </div>
        )}

        {/* Title */}
        <p className="text-sm text-zinc-100 font-medium leading-snug mb-2">
          {ticket.title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          <PriorityBadge priority={ticket.priority} />
          {ticket.storyPoints > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-700 rounded px-1.5 py-0.5">
              {ticket.storyPoints} pts
            </span>
          )}
        </div>
      </div>

      {showDetail && (
        <TicketDetailModal
          ticket={ticket}
          workspaceId={workspaceId}
          sprintId={sprintId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
