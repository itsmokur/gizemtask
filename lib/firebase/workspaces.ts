import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";
import { Workspace } from "@/types";

// Create a new workspace
export async function createWorkspace(
  name: string,
  ownerId: string
): Promise<Workspace> {
  const workspacesRef = collection(db, "workspaces");
  const docRef = await addDoc(workspacesRef, {
    name,
    ownerId,
    members: [ownerId],
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    name,
    ownerId,
    members: [ownerId],
    createdAt: new Date(),
  };
}

// Get all workspaces the user is a member of
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const q = query(
    collection(db, "workspaces"),
    where("members", "array-contains", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Workspace[];
}

// Get a single workspace by ID
export async function getWorkspace(
  workspaceId: string
): Promise<Workspace | null> {
  const docRef = doc(db, "workspaces", workspaceId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
  } as Workspace;
}

// Add a member to a workspace by email (requires user lookup)
export async function addMemberToWorkspace(
  workspaceId: string,
  userId: string
) {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  const snapshot = await getDoc(workspaceRef);

  if (!snapshot.exists()) throw new Error("Workspace not found");

  const members: string[] = snapshot.data().members || [];
  if (members.includes(userId)) return;

  await updateDoc(workspaceRef, {
    members: [...members, userId],
  });
}

// Update workspace name
export async function updateWorkspaceName(
  workspaceId: string,
  name: string
) {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, { name });
}
