import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";
import { Ticket, TicketStatus, Priority, CreateTicketInput } from "@/types";

function toTicket(id: string, data: Record<string, unknown>): Ticket {
  return {
    id,
    title: data.title as string,
    description: (data.description as string) || "",
    status: data.status as TicketStatus,
    priority: data.priority as Priority,
    assigneeId: (data.assigneeId as string | null) ?? null,
    labels: (data.labels as string[]) || [],
    storyPoints: (data.storyPoints as number) || 0,
    order: (data.order as number) || 0,
    sprintId: data.sprintId as string,
    workspaceId: data.workspaceId as string,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

// Subscribe to real-time ticket updates for a sprint
export function subscribeToTickets(
  workspaceId: string,
  sprintId: string,
  callback: (tickets: Ticket[]) => void
) {
  const q = query(
    collection(db, "workspaces", workspaceId, "sprints", sprintId, "tickets"),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const tickets = snapshot.docs.map((doc) =>
      toTicket(doc.id, doc.data() as Record<string, unknown>)
    );
    callback(tickets);
  });
}

// Get tickets for a sprint (one-time fetch)
export async function getTickets(
  workspaceId: string,
  sprintId: string
): Promise<Ticket[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "sprints", sprintId, "tickets"),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    toTicket(doc.id, doc.data() as Record<string, unknown>)
  );
}

// Create a new ticket
export async function createTicket(
  workspaceId: string,
  sprintId: string,
  input: CreateTicketInput,
  order: number
): Promise<Ticket> {
  const ticketsRef = collection(
    db,
    "workspaces",
    workspaceId,
    "sprints",
    sprintId,
    "tickets"
  );

  const docRef = await addDoc(ticketsRef, {
    title: input.title,
    description: input.description || "",
    status: "todo" as TicketStatus,
    priority: input.priority,
    assigneeId: input.assigneeId ?? null,
    labels: input.labels || [],
    storyPoints: input.storyPoints || 0,
    order,
    sprintId,
    workspaceId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    title: input.title,
    description: input.description || "",
    status: "todo",
    priority: input.priority,
    assigneeId: input.assigneeId ?? null,
    labels: input.labels || [],
    storyPoints: input.storyPoints || 0,
    order,
    sprintId,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Update a ticket's fields
export async function updateTicket(
  workspaceId: string,
  sprintId: string,
  ticketId: string,
  updates: Partial<Omit<Ticket, "id" | "createdAt">>
) {
  const ticketRef = doc(
    db,
    "workspaces",
    workspaceId,
    "sprints",
    sprintId,
    "tickets",
    ticketId
  );
  await updateDoc(ticketRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Batch update ticket orders and statuses after a drag operation
export async function batchUpdateTicketPositions(
  workspaceId: string,
  sprintId: string,
  updates: { id: string; order: number; status: TicketStatus }[]
) {
  const batch = writeBatch(db);

  updates.forEach(({ id, order, status }) => {
    const ticketRef = doc(
      db,
      "workspaces",
      workspaceId,
      "sprints",
      sprintId,
      "tickets",
      id
    );
    batch.update(ticketRef, { order, status, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

// Delete a ticket
export async function deleteTicket(
  workspaceId: string,
  sprintId: string,
  ticketId: string
) {
  const ticketRef = doc(
    db,
    "workspaces",
    workspaceId,
    "sprints",
    sprintId,
    "tickets",
    ticketId
  );
  await deleteDoc(ticketRef);
}
