"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Workspace, Sprint } from "@/types";
import { getWorkspace } from "@/lib/firebase/workspaces";
import { getSprints } from "@/lib/firebase/sprints";
import { useAuth } from "@/context/AuthContext";

interface WorkspaceContextType {
  workspace: Workspace | null;
  sprints: Sprint[];
  activeSprint: Sprint | null;
  selectedSprintId: string | null;
  setSelectedSprintId: (id: string) => void;
  loading: boolean;
  refreshSprints: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({
  children,
  workspaceId,
}: {
  children: ReactNode;
  workspaceId: string;
}) {
  const { user, loading: authLoading } = useAuth(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    const [ws, sprintList] = await Promise.all([
      getWorkspace(workspaceId),
      getSprints(workspaceId),
    ]);
    setWorkspace(ws);
    setSprints(sprintList);

    // Auto-select the active sprint, or the first sprint
    const active = sprintList.find((s) => s.status === "active");
    if (active) {
      setSelectedSprintId(active.id);
    } else if (sprintList.length > 0 && !selectedSprintId) {
      setSelectedSprintId(sprintList[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, authLoading, user]);

  const activeSprint = sprints.find((s) => s.status === "active") || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        sprints,
        activeSprint,
        selectedSprintId,
        setSelectedSprintId,
        loading,
        refreshSprints: fetchData,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
