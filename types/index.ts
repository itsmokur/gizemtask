export type Priority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "todo" | "inprogress" | "done";
export type SprintStatus = "planned" | "active" | "completed";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assigneeId: string | null;
  labels: string[];
  storyPoints: number;
  order: number;
  sprintId: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  storyPoints: number;
  order: number;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  columnOrder: TicketStatus[];
  workspaceId: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt: Date;
}

export interface WorkspaceMember {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

// Columns for the Kanban board
export interface BoardColumn {
  id: TicketStatus;
  title: string;
  tickets: Ticket[];
}

// Form types
export interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  storyPoints: number;
  assigneeId?: string | null;
}

export interface CreateBacklogItemInput {
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  storyPoints: number;
}

export interface CreateSprintInput {
  name: string;
  startDate: Date;
  endDate: Date;
}
