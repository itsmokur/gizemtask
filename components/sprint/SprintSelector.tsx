"use client";

import { useState } from "react";
import { Sprint, CreateSprintInput } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createSprint } from "@/lib/firebase/sprints";

interface SprintSelectorProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelect: (id: string) => void;
  workspaceId: string;
  onSprintCreated: () => void;
}

export function SprintSelector({
  sprints,
  selectedSprintId,
  onSelect,
  workspaceId,
  onSprintCreated,
}: SprintSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;

    setLoading(true);
    try {
      const input: CreateSprintInput = {
        name: name.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      };
      const sprint = await createSprint(workspaceId, input);
      onSelect(sprint.id);
      onSprintCreated();
      setShowCreate(false);
      setName("");
      setStartDate("");
      setEndDate("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {sprints.map((sprint) => (
          <button
            key={sprint.id}
            onClick={() => onSelect(sprint.id)}
            className={`
              px-3 py-1.5 rounded-lg text-sm transition-colors
              ${
                selectedSprintId === sprint.id
                  ? "bg-violet-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }
            `}
          >
            {sprint.name}
          </button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreate(true)}
          className="gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Sprint
        </Button>
      </div>

      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Sprint"
        size="sm"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Sprint Name
            </label>
            <input
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
              placeholder="Sprint 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              End Date
            </label>
            <input
              type="date"
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" loading={loading}>
              Create Sprint
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
