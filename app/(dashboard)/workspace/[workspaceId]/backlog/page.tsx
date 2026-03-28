"use client";

import { useWorkspace } from "@/context/WorkspaceContext";
import { BacklogList } from "@/components/backlog/BacklogList";

export default function BacklogPage() {
  const { workspace, sprints, loading } = useWorkspace();

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
    <div className="p-6 max-w-4xl mx-auto">
      <BacklogList workspaceId={workspace.id} sprints={sprints} />
    </div>
  );
}
