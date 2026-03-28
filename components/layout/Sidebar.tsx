"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Workspace } from "@/types";
import { logout } from "@/lib/firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

interface SidebarProps {
  workspace: Workspace | null;
  workspaceId: string;
}

const NAV_ITEMS = [
  {
    label: "Board",
    href: (id: string) => `/workspace/${id}/board`,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    label: "Backlog",
    href: (id: string) => `/workspace/${id}/backlog`,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: (id: string) => `/workspace/${id}/settings`,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function Sidebar({ workspace, workspaceId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  return (
    <aside className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      {/* Workspace name */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <span className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
            {workspace?.name || "GizemRetro"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const href = item.href(workspaceId);
          const isActive = pathname === href;
          return (
            <Link
              key={item.label}
              href={href}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Logout */}
      <div className="px-4 py-4 border-t border-zinc-800">
        {user && (
          <div className="flex items-center gap-2.5 mb-3">
            <Avatar
              name={user.displayName || user.email || "User"}
              photoURL={user.photoURL}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">
                {user.displayName || "User"}
              </p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={async () => { await logout(); router.replace("/login"); }}
          className="w-full text-left text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
