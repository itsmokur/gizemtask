"use client";

import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { updateWorkspaceName } from "@/lib/firebase/workspaces";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { workspace, loading, refreshSprints } = useWorkspace();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize name input once workspace loads
  if (!name && workspace?.name) {
    setName(workspace.name);
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !name.trim()) return;
    setSaving(true);
    try {
      await updateWorkspaceName(workspace.id, name.trim());
      setSaved(true);
      await refreshSprints();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Workspace Settings</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
              Workspace Name
            </label>
            <input
              className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={saving}>
              Save
            </Button>
            {saved && (
              <span className="text-sm text-emerald-400">Saved!</span>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-200 mb-1">Workspace ID</h2>
        <p className="text-xs text-zinc-500 font-mono break-all">
          {workspace?.id}
        </p>
        <p className="text-xs text-zinc-600 mt-2">
          Share this ID with teammates to add them to the workspace (feature coming soon).
        </p>
      </div>
    </div>
  );
}
