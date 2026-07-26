export type Rating = "again" | "hard" | "good" | "easy";

export interface Card {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  // Spaced repetition state
  interval: number; // days until next review
  repetitions: number; // consecutive successful reviews
  easeFactor: number; // SM-2 ease factor
  dueDate: string; // ISO date string
  lastReviewed: string | null;
  history: Rating[]; // most recent last
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  cards: Card[];
}

export interface StatsSnapshot {
  totalCards: number;
  dueToday: number;
  mastered: number; // interval >= 21 days
  learning: number; // interval < 21 days, repetitions > 0
  newCards: number; // repetitions === 0
}
