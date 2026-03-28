"use client";

import { useState } from "react";
import { Priority, CreateTicketInput } from "@/types";
import { Button } from "@/components/ui/Button";
import { createTicket } from "@/lib/firebase/tickets";

interface AddTicketFormProps {
  workspaceId: string;
  sprintId: string;
  currentCount: number;
  onAdded: () => void;
  onCancel: () => void;
}

export function AddTicketForm({
  workspaceId,
  sprintId,
  currentCount,
  onAdded,
  onCancel,
}: AddTicketFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [storyPoints, setStoryPoints] = useState(0);
  const [labelsInput, setLabelsInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const input: CreateTicketInput = {
        title: title.trim(),
        description,
        priority,
        storyPoints,
        labels: labelsInput
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      };
      await createTicket(workspaceId, sprintId, input, currentCount);
      onAdded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        autoFocus
        className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        placeholder="Ticket title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        rows={2}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="flex gap-2">
        <select
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <input
          type="number"
          min={0}
          max={100}
          className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-violet-500"
          placeholder="pts"
          value={storyPoints || ""}
          onChange={(e) => setStoryPoints(Number(e.target.value))}
        />
      </div>

      <input
        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
        placeholder="Labels: frontend, bug, ux"
        value={labelsInput}
        onChange={(e) => setLabelsInput(e.target.value)}
      />

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={loading}>
          Add Ticket
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
