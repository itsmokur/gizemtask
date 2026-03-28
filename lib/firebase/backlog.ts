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
import {
  BacklogItem,
  Priority,
  CreateBacklogItemInput,
  CreateTicketInput,
} from "@/types";
import { createTicket } from "./tickets";

function toBacklogItem(
  id: string,
  data: Record<string, unknown>
): BacklogItem {
  return {
    id,
    title: data.title as string,
    description: (data.description as string) || "",
    priority: data.priority as Priority,
    labels: (data.labels as string[]) || [],
    storyPoints: (data.storyPoints as number) || 0,
    order: (data.order as number) || 0,
    workspaceId: data.workspaceId as string,
    createdAt:
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt:
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
  };
}

// Subscribe to real-time backlog updates
export function subscribeToBacklog(
  workspaceId: string,
  callback: (items: BacklogItem[]) => void
) {
  const q = query(
    collection(db, "workspaces", workspaceId, "backlog"),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) =>
      toBacklogItem(doc.id, doc.data() as Record<string, unknown>)
    );
    callback(items);
  });
}

// Create a new backlog item
export async function createBacklogItem(
  workspaceId: string,
  input: CreateBacklogItemInput,
  order: number
): Promise<BacklogItem> {
  const backlogRef = collection(db, "workspaces", workspaceId, "backlog");

  const docRef = await addDoc(backlogRef, {
    title: input.title,
    description: input.description || "",
    priority: input.priority,
    labels: input.labels || [],
    storyPoints: input.storyPoints || 0,
    order,
    workspaceId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    title: input.title,
    description: input.description || "",
    priority: input.priority,
    labels: input.labels || [],
    storyPoints: input.storyPoints || 0,
    order,
    workspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Update a backlog item
export async function updateBacklogItem(
  workspaceId: string,
  itemId: string,
  updates: Partial<Omit<BacklogItem, "id" | "createdAt">>
) {
  const itemRef = doc(db, "workspaces", workspaceId, "backlog", itemId);
  await updateDoc(itemRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Batch update backlog item order after drag
export async function batchUpdateBacklogOrder(
  workspaceId: string,
  updates: { id: string; order: number }[]
) {
  const batch = writeBatch(db);

  updates.forEach(({ id, order }) => {
    const itemRef = doc(db, "workspaces", workspaceId, "backlog", id);
    batch.update(itemRef, { order, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

// Move backlog item to a sprint — creates a ticket and deletes the backlog item
export async function moveBacklogItemToSprint(
  workspaceId: string,
  itemId: string,
  item: BacklogItem,
  sprintId: string,
  ticketOrder: number
) {
  const ticketInput: CreateTicketInput = {
    title: item.title,
    description: item.description,
    priority: item.priority,
    labels: item.labels,
    storyPoints: item.storyPoints,
    assigneeId: null,
  };

  // Create the ticket in the sprint
  await createTicket(workspaceId, sprintId, ticketInput, ticketOrder);

  // Remove from backlog
  const itemRef = doc(db, "workspaces", workspaceId, "backlog", itemId);
  await deleteDoc(itemRef);
}

// Delete a backlog item
export async function deleteBacklogItem(
  workspaceId: string,
  itemId: string
) {
  const itemRef = doc(db, "workspaces", workspaceId, "backlog", itemId);
  await deleteDoc(itemRef);
}
