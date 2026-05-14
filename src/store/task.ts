import { atom } from "jotai";

const _taskAtom = atom("");

export const taskAtom = atom(
  (get) => get(_taskAtom),
  (_get, set, newVal: string) => set(_taskAtom, newVal),
);
