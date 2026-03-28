"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BacklogItem as BacklogItemType, Sprint } from "@/types";
import { PriorityBadge, LabelBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MoveToSprintModal } from "./MoveToSprintModal";
import { deleteBacklogItem } from "@/lib/firebase/backlog";

interface BacklogItemProps {
  item: BacklogItemType;
  sprints: Sprint[];
  workspaceId: string;
  currentTicketCount: number;
}

export function BacklogItemRow({
  item,
  sprints,
  workspaceId,
  currentTicketCount,
}: BacklogItemProps) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  async function handleDelete() {
    if (!confirm("Delete this backlog item?")) return;
    setDeleting(true);
    try {
      await deleteBacklogItem(workspaceId, item.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3
          hover:border-zinc-700 transition-colors group
          ${isDragging ? "opacity-40 shadow-2xl ring-1 ring-violet-500" : ""}
        `}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm8-16a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-100 truncate">{item.title}</p>
          {item.description && (
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.description}</p>
          )}
          {item.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.labels.map((label) => (
                <LabelBadge key={label} label={label} />
              ))}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <PriorityBadge priority={item.priority} />
          {item.storyPoints > 0 && (
            <span className="text-xs text-zinc-500 bg-zinc-800 rounded px-2 py-0.5">
              {item.storyPoints} pts
            </span>
          )}
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowMoveModal(true)}
          >
            Move to Sprint
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            loading={deleting}
            className="text-red-400 hover:text-red-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {showMoveModal && (
        <MoveToSprintModal
          item={item}
          sprints={sprints}
          workspaceId={workspaceId}
          currentTicketCount={currentTicketCount}
          onClose={() => setShowMoveModal(false)}
          onMoved={() => setShowMoveModal(false)}
        />
      )}
    </>
  );
}
