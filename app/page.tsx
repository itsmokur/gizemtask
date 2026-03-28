"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserWorkspaces, createWorkspace } from "@/lib/firebase/workspaces";
import { Workspace } from "@/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [fetching, setFetching] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading && !timedOut) return;
    if (!user) return;

    setFetching(true);
    getUserWorkspaces(user.uid).then((ws) => {
      setWorkspaces(ws);
      setFetching(false);
      if (ws.length === 1) {
        router.replace(`/workspace/${ws[0].id}/board`);
      }
    });
  }, [user, loading, timedOut, router]);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceName.trim() || !user) return;
    setCreating(true);
    try {
      const ws = await createWorkspace(workspaceName.trim(), user.uid);
      router.push(`/workspace/${ws.id}/board`);
    } finally {
      setCreating(false);
    }
  }

  // Auth resolving
  if ((loading && !timedOut) || (user && fetching)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Logged in — workspace selector
  if (user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
              G
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">Your Workspaces</h1>
            <p className="text-sm text-zinc-500 mt-1">Select a workspace to continue</p>
          </div>

          <div className="space-y-2 mb-4">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => router.push(`/workspace/${ws.id}/board`)}
                className="w-full flex items-center gap-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-4 py-3 text-left transition-colors"
              >
                <div className="w-9 h-9 bg-violet-700 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{ws.name}</p>
                  <p className="text-xs text-zinc-500">
                    {ws.members.length} member{ws.members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <Button className="w-full" onClick={() => setShowCreate(true)}>
            + Create New Workspace
          </Button>

          <Modal
            isOpen={showCreate}
            onClose={() => setShowCreate(false)}
            title="Create Workspace"
            size="sm"
          >
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Workspace Name
                </label>
                <input
                  autoFocus
                  required
                  className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
                  placeholder="My Team"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={creating}>
                  Create
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    );
  }

  // Not logged in — marketing placeholder
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
          G
        </div>
        <h1 className="text-4xl font-bold text-zinc-100 mb-3">GizemRetro</h1>
        <p className="text-zinc-400 mb-8">
          Run better retrospectives with your team.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button>Get started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
