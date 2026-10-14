import { Task } from "@/trpc/client";
import { atom } from "jotai";

const _editingTaskAtom = atom<Task>();

export const editingTaskAtom = atom(
  (get) => get(_editingTaskAtom),
  (_get, set, newVal: Task) => set(_editingTaskAtom, newVal),
);
