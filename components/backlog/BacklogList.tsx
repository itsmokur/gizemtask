"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Sprint } from "@/types";
import { useBacklog } from "@/lib/hooks/useBacklog";
import { createBacklogItem } from "@/lib/firebase/backlog";
import { BacklogItemRow } from "./BacklogItem";
import { Button } from "@/components/ui/Button";
import { Priority, CreateBacklogItemInput } from "@/types";

interface BacklogListProps {
  workspaceId: string;
  sprints: Sprint[];
}

export function BacklogList({ workspaceId, sprints }: BacklogListProps) {
  const { items, loading, handleDragEnd } = useBacklog(workspaceId);
  const [addingItem, setAddingItem] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [storyPoints, setStoryPoints] = useState(0);
  const [labelsInput, setLabelsInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Filter items by search and priority
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      filterPriority === "all" || item.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const input: CreateBacklogItemInput = {
        title: title.trim(),
        description,
        priority,
        labels: labelsInput
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        storyPoints,
      };
      await createBacklogItem(workspaceId, input, items.length);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setStoryPoints(0);
      setLabelsInput("");
      setAddingItem(false);
    } finally {
      setSaving(false);
    }
  }

  const totalPoints = items.reduce((sum, i) => sum + i.storyPoints, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-zinc-500 text-sm animate-pulse">Loading backlog...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-100">Backlog</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {items.length} items · {totalPoints} total points
          </p>
        </div>
        <Button onClick={() => setAddingItem(true)} size="sm">
          + Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="flex-1 min-w-[200px] bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          placeholder="Search backlog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | "all")}
        >
          <option value="all">All priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Add item form */}
      {addingItem && (
        <form
          onSubmit={handleAddItem}
          className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3"
        >
          <input
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            placeholder="Backlog item title..."
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
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
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
              className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-violet-500"
              placeholder="pts"
              value={storyPoints || ""}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
            />
          </div>
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            placeholder="Labels: frontend, bug, ux"
            value={labelsInput}
            onChange={(e) => setLabelsInput(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={saving}>
              Add to Backlog
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setAddingItem(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Item list */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">
            {items.length === 0 ? "Backlog is empty" : "No items match your filter"}
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <BacklogItemRow
                  key={item.id}
                  item={item}
                  sprints={sprints}
                  workspaceId={workspaceId}
                  currentTicketCount={0}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
