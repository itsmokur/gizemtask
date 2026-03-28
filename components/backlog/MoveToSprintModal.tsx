"use client";

import { useState } from "react";
import { BacklogItem, Sprint } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { moveBacklogItemToSprint } from "@/lib/firebase/backlog";

interface MoveToSprintModalProps {
  item: BacklogItem;
  sprints: Sprint[];
  workspaceId: string;
  currentTicketCount: number;
  onClose: () => void;
  onMoved: () => void;
}

export function MoveToSprintModal({
  item,
  sprints,
  workspaceId,
  currentTicketCount,
  onClose,
  onMoved,
}: MoveToSprintModalProps) {
  const activeSprints = sprints.filter(
    (s) => s.status === "active" || s.status === "planned"
  );

  const [selectedSprintId, setSelectedSprintId] = useState(
    activeSprints[0]?.id || ""
  );
  const [loading, setLoading] = useState(false);

  async function handleMove() {
    if (!selectedSprintId) return;
    setLoading(true);
    try {
      await moveBacklogItemToSprint(
        workspaceId,
        item.id,
        item,
        selectedSprintId,
        currentTicketCount
      );
      onMoved();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Move to Sprint" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Move <span className="text-zinc-200 font-medium">{item.title}</span> to:
        </p>

        {activeSprints.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">
            No active or planned sprints. Create a sprint first.
          </p>
        ) : (
          <div className="space-y-2">
            {activeSprints.map((sprint) => (
              <label
                key={sprint.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 hover:border-zinc-600 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="sprint"
                  value={sprint.id}
                  checked={selectedSprintId === sprint.id}
                  onChange={() => setSelectedSprintId(sprint.id)}
                  className="accent-violet-500"
                />
                <div>
                  <p className="text-sm text-zinc-200 font-medium">{sprint.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{sprint.status}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            onClick={handleMove}
            loading={loading}
            disabled={!selectedSprintId}
          >
            Move to Sprint
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
