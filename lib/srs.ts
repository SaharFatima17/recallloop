import { Card, Rating } from "./types";

// Simplified SM-2 spaced repetition algorithm.
// Quality mapping: again=0, hard=3, good=4, easy=5 (on SM-2's 0-5 scale)
const QUALITY: Record<Rating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE = 1.3;

export function scheduleNextReview(card: Card, rating: Rating): Card {
  const quality = QUALITY[rating];
  let { interval, repetitions, easeFactor } = card;

  if (quality < 3) {
    // Forgot it: reset the learning streak, review again tomorrow.
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < MIN_EASE) easeFactor = MIN_EASE;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);
  dueDate.setHours(0, 0, 0, 0);

  return {
    ...card,
    interval,
    repetitions,
    easeFactor: Math.round(easeFactor * 100) / 100,
    dueDate: dueDate.toISOString(),
    lastReviewed: new Date().toISOString(),
    history: [...card.history, rating].slice(-20),
  };
}

export function isDue(card: Card, now: Date = new Date()): boolean {
  return new Date(card.dueDate).getTime() <= now.getTime();
}

export function isMastered(card: Card): boolean {
  return card.interval >= 21 && card.repetitions > 0;
}

export function isNew(card: Card): boolean {
  return card.repetitions === 0 && card.history.length === 0;
}

export function createFreshCard(question: string, answer: string): Card {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    question,
    answer,
    createdAt: now.toISOString(),
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: now.toISOString(), // due immediately
    lastReviewed: null,
    history: [],
  };
}
