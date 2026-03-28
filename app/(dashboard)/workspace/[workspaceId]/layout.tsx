"use client";

import { use } from "react";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { useWorkspace } from "@/context/WorkspaceContext";

// Inner layout that can access WorkspaceContext
function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { workspace } = useWorkspace();
  const workspaceId =
    workspace?.id || (typeof window !== "undefined"
      ? window.location.pathname.split("/")[2]
      : "");

  return (
    <div className="flex min-h-screen">
      <Sidebar workspace={workspace} workspaceId={workspaceId} />
      <main className="flex-1 overflow-auto bg-zinc-950">
        {children}
      </main>
    </div>
  );
}

export default function WorkspaceRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <WorkspaceLayout>{children}</WorkspaceLayout>
    </WorkspaceProvider>
  );
}
