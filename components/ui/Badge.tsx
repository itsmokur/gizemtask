import { Priority } from "@/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-slate-700 text-slate-300",
  medium: "bg-blue-900/60 text-blue-300",
  high: "bg-orange-900/60 text-orange-300",
  critical: "bg-red-900/60 text-red-400",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className = "" }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_STYLES[priority]} ${className}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

interface LabelBadgeProps {
  label: string;
}

export function LabelBadge({ label }: LabelBadgeProps) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-900/50 text-purple-300 border border-purple-700/40">
      {label}
    </span>
  );
}
