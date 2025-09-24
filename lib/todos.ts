// lib/todos.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs, query,
    updateDoc,
    where
} from "firebase/firestore";
import { db } from "./firebase";

const todosCol = collection(db, "todos");

export type Todo = {
  _id: string;
  text: string;
  done?: boolean;
  owner: string | null;
  createdAt: number;
};

export async function fetchTodos(owner?: string | null): Promise<Todo[]> {
  if (owner) {
    const email = owner.trim().toLowerCase();
    const [mineSnap, publicSnap] = await Promise.all([
      getDocs(query(todosCol, where("owner", "==", email))),
      getDocs(query(todosCol, where("owner", "==", null))),
    ]);

    const mine = mineSnap.docs.map((d) => ({ _id: d.id, ...(d.data() as any) }));
    const pub  = publicSnap.docs.map((d) => ({ _id: d.id, ...(d.data() as any) }));
    return [...mine, ...pub].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)) as Todo[];
  }

  const snap = await getDocs(todosCol);
  const rows = snap.docs.map((d) => ({ _id: d.id, ...(d.data() as any) }));
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)) as Todo[];
}

export async function createTodo(text: string, owner?: string | null): Promise<Todo> {
  const payload = {
    text: text.trim(),
    done: false,
    owner: owner ? owner.trim().toLowerCase() : null,
    createdAt: Date.now(),
  };
  const ref = await addDoc(todosCol, payload);
  return { _id: ref.id, ...payload };
}

export async function updateTodo(
  id: string,
  patch: { text?: string; done?: boolean }
): Promise<Partial<Todo> & { _id: string }> {
  const updates: any = {};
  if (typeof patch.text === "string") updates.text = patch.text.trim();
  if (typeof patch.done === "boolean") updates.done = patch.done;
  if (Object.keys(updates).length === 0) return { _id: id };

  await updateDoc(doc(db, "todos", id), updates);
  return { _id: id, ...updates };
}

export async function deleteTodo(id: string): Promise<{ ok: true }> {
  await deleteDoc(doc(db, "todos", id));
  return { ok: true };
}
