import { atom } from "jotai";

const _dragAtom = atom("");

export const dragAtom = atom(
  (get) => get(_dragAtom),
  (_get, set, newVal: string) => set(_dragAtom, newVal),
);
