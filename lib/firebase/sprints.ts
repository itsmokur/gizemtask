import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Sprint, SprintStatus, CreateSprintInput } from "@/types";

function toSprint(id: string, data: Record<string, unknown>): Sprint {
  return {
    id,
    name: data.name as string,
    status: data.status as SprintStatus,
    columnOrder: (data.columnOrder as Sprint["columnOrder"]) || [
      "todo",
      "inprogress",
      "done",
    ],
    workspaceId: data.workspaceId as string,
    startDate:
      data.startDate instanceof Timestamp
        ? data.startDate.toDate()
        : new Date(data.startDate as string),
    endDate:
      data.endDate instanceof Timestamp
        ? data.endDate.toDate()
        : new Date(data.endDate as string),
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(),
  };
}

// Get all sprints for a workspace
export async function getSprints(workspaceId: string): Promise<Sprint[]> {
  const q = query(
    collection(db, "workspaces", workspaceId, "sprints"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) =>
    toSprint(doc.id, doc.data() as Record<string, unknown>)
  );
}

// Create a new sprint
export async function createSprint(
  workspaceId: string,
  input: CreateSprintInput
): Promise<Sprint> {
  const sprintsRef = collection(db, "workspaces", workspaceId, "sprints");
  const docRef = await addDoc(sprintsRef, {
    name: input.name,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    status: "planned" as SprintStatus,
    columnOrder: ["todo", "inprogress", "done"],
    workspaceId,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "planned",
    columnOrder: ["todo", "inprogress", "done"],
    workspaceId,
    createdAt: new Date(),
  };
}

// Update sprint status
export async function updateSprintStatus(
  workspaceId: string,
  sprintId: string,
  status: SprintStatus
) {
  const sprintRef = doc(db, "workspaces", workspaceId, "sprints", sprintId);
  await updateDoc(sprintRef, { status });
}

// Delete sprint
export async function deleteSprint(workspaceId: string, sprintId: string) {
  const sprintRef = doc(db, "workspaces", workspaceId, "sprints", sprintId);
  await deleteDoc(sprintRef);
}
