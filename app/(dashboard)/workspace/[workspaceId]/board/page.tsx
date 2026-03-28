"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { useBoard } from "@/lib/hooks/useBoard";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { SprintHeader } from "@/components/sprint/SprintHeader";
import { SprintSelector } from "@/components/sprint/SprintSelector";

export default function BoardPage() {
  const {
    workspace,
    sprints,
    selectedSprintId,
    setSelectedSprintId,
    loading,
    refreshSprints,
  } = useWorkspace();

  // Get story point stats for the selected sprint
  const { storyPointTotal, completedPoints } = useBoard(
    workspace?.id || "",
    selectedSprintId
  );

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500">
        Workspace not found.
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Sprint selector tabs */}
      <div className="mb-6">
        <SprintSelector
          sprints={sprints}
          selectedSprintId={selectedSprintId}
          onSelect={setSelectedSprintId}
          workspaceId={workspace.id}
          onSprintCreated={refreshSprints}
        />
      </div>

      {/* Sprint header with progress */}
      {selectedSprint ? (
        <>
          <SprintHeader
            sprint={selectedSprint}
            workspaceId={workspace.id}
            storyPointTotal={storyPointTotal}
            completedPoints={completedPoints}
            onSprintUpdated={refreshSprints}
          />

          {/* Kanban board */}
          <KanbanBoard
            workspaceId={workspace.id}
            sprintId={selectedSprint.id}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <svg
            className="w-16 h-16 mb-4 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <p className="text-sm">No sprints yet. Create your first sprint to get started.</p>
        </div>
      )}
    </div>
  );
}
