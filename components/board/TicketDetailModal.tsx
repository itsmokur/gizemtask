"use client";

import { useState } from "react";
import { Ticket, Priority } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { PriorityBadge } from "@/components/ui/Badge";
import { updateTicket, deleteTicket } from "@/lib/firebase/tickets";

interface TicketDetailModalProps {
  ticket: Ticket;
  workspaceId: string;
  sprintId: string;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];

export function TicketDetailModal({
  ticket,
  workspaceId,
  sprintId,
  onClose,
}: TicketDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [storyPoints, setStoryPoints] = useState(ticket.storyPoints);
  const [labelsInput, setLabelsInput] = useState(ticket.labels.join(", "));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateTicket(workspaceId, sprintId, ticket.id, {
        title,
        description,
        priority,
        storyPoints,
        labels: labelsInput
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this ticket?")) return;
    setDeleting(true);
    try {
      await deleteTicket(workspaceId, sprintId, ticket.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} title="Ticket Detail" size="lg">
      <div className="space-y-4">
        {editing ? (
          <>
            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Title
              </label>
              <input
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Description
              </label>
              <textarea
                rows={4}
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Story Points
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Labels (comma-separated)
              </label>
              <input
                className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="frontend, bug, ux"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
              <Button
                variant="ghost"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>

            <div className="flex items-center gap-3 flex-wrap">
              <PriorityBadge priority={ticket.priority} />
              {ticket.storyPoints > 0 && (
                <span className="text-xs text-zinc-400 bg-zinc-800 rounded px-2 py-0.5">
                  {ticket.storyPoints} story points
                </span>
              )}
              <span className="text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-0.5 rounded">
                {ticket.status === "inprogress" ? "In Progress" : ticket.status}
              </span>
            </div>

            {ticket.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {ticket.labels.map((label) => (
                  <span
                    key={label}
                    className="text-xs bg-purple-900/50 text-purple-300 border border-purple-700/40 rounded px-2 py-0.5"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {description ? (
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            ) : (
              <p className="text-sm text-zinc-600 italic">No description.</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setEditing(true)} variant="secondary">
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
