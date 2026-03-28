"use client";

import { Sprint } from "@/types";
import { Button } from "@/components/ui/Button";
import { updateSprintStatus } from "@/lib/firebase/sprints";
import { useState } from "react";

interface SprintHeaderProps {
  sprint: Sprint;
  workspaceId: string;
  storyPointTotal: number;
  completedPoints: number;
  onSprintUpdated: () => void;
}

const STATUS_BADGE: Record<Sprint["status"], string> = {
  planned: "bg-zinc-700 text-zinc-300",
  active: "bg-emerald-900/60 text-emerald-400 border border-emerald-700/50",
  completed: "bg-blue-900/60 text-blue-300",
};

export function SprintHeader({
  sprint,
  workspaceId,
  storyPointTotal,
  completedPoints,
  onSprintUpdated,
}: SprintHeaderProps) {
  const [loading, setLoading] = useState(false);

  const progress =
    storyPointTotal > 0 ? Math.round((completedPoints / storyPointTotal) * 100) : 0;

  async function handleStatusChange() {
    const nextStatus =
      sprint.status === "planned"
        ? "active"
        : sprint.status === "active"
        ? "completed"
        : null;

    if (!nextStatus) return;

    setLoading(true);
    try {
      await updateSprintStatus(workspaceId, sprint.id, nextStatus);
      onSprintUpdated();
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-zinc-100">{sprint.name}</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_BADGE[sprint.status]}`}
            >
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {formatDate(sprint.startDate)} — {formatDate(sprint.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Story point progress */}
          <div className="text-right">
            <p className="text-xs text-zinc-500">
              {completedPoints} / {storyPointTotal} pts
            </p>
            <div className="mt-1 w-28 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {sprint.status !== "completed" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStatusChange}
              loading={loading}
            >
              {sprint.status === "planned" ? "Start Sprint" : "Complete Sprint"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
