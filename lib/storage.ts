import { Deck } from "./types";

const STORAGE_KEY = "recallloop:decks:v1";

export function loadDecks(): Deck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Deck[];
  } catch {
    return [];
  }
}

export function saveDecks(decks: Deck[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function exportDecks(): string {
  return JSON.stringify(loadDecks(), null, 2);
}

export function importDecks(json: string): Deck[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid file format");
  saveDecks(parsed);
  return parsed;
}
