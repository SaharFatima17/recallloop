"use client";

import { useMemo, useState } from "react";
import { Card, Rating } from "@/lib/types";
import { isDue } from "@/lib/srs";
import { X } from "lucide-react";

interface Props {
  deckTitle: string;
  cards: Card[];
  onRate: (cardId: string, rating: Rating) => void;
  onClose: () => void;
}

const RATING_META: { key: Rating; label: string; sub: string; className: string }[] = [
  { key: "again", label: "Again", sub: "forgot it", className: "bg-[var(--color-forgot)]/15 border-[var(--color-forgot)] text-[var(--color-forgot)] hover:bg-[var(--color-forgot)]/25" },
  { key: "hard", label: "Hard", sub: "barely got it", className: "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-spark)]" },
  { key: "good", label: "Good", sub: "recalled it", className: "border-[var(--color-spark)] text-[var(--color-spark)] hover:bg-[var(--color-spark)]/10" },
  { key: "easy", label: "Easy", sub: "instant", className: "bg-[var(--color-mastery)]/15 border-[var(--color-mastery)] text-[var(--color-mastery)] hover:bg-[var(--color-mastery)]/25" },
];

export default function StudySession({ deckTitle, cards, onRate, onClose }: Props) {
  const queue = useMemo(() => cards.filter((c) => isDue(c)), [cards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const current = queue[index];
  const remaining = queue.length - index;

  function handleRate(rating: Rating) {
    if (!current) return;
    onRate(current.id, rating);
    setDoneCount((n) => n + 1);
    setFlipped(false);
    setTimeout(() => setIndex((i) => i + 1), 60);
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-ink)]/95 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-mono">
            Studying
          </p>
          <h2 className="font-display text-lg">{deckTitle}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-[var(--color-surface)] transition-colors"
          aria-label="Close study session"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {!current ? (
          <div className="text-center animate-fade-up">
            <p className="font-display text-3xl mb-2">
              {doneCount > 0 ? "All caught up." : "Nothing due right now."}
            </p>
            <p className="text-[var(--color-text-muted)] mb-8">
              {doneCount > 0
                ? `You reviewed ${doneCount} card${doneCount === 1 ? "" : "s"}. RecallLoop will bring the rest back exactly when you're about to forget them.`
                : "Add more cards, or come back when today's reviews are due."}
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity"
            >
              Back to deck
            </button>
          </div>
        ) : (
          <div className="w-full max-w-xl">
            <p className="text-center text-xs font-mono text-[var(--color-text-muted)] mb-6">
              {remaining} left this session
            </p>
            <div className="flip-scene h-72">
              <div
                className={`flip-card relative w-full h-full cursor-pointer ${flipped ? "is-flipped" : ""}`}
                onClick={() => setFlipped((f) => !f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}
              >
                <div className="flip-face absolute inset-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] font-mono mb-4">
                    Question
                  </p>
                  <p className="font-display text-2xl leading-snug">{current.question}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-6">
                    Tap to reveal answer
                  </p>
                </div>
                <div className="flip-face flip-face-back absolute inset-0 rounded-2xl border border-[var(--color-spark)] bg-[var(--color-surface-raised)] p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-spark)] font-mono mb-4">
                    Answer
                  </p>
                  <p className="font-display text-xl leading-snug">{current.answer}</p>
                </div>
              </div>
            </div>

            {flipped ? (
              <div className="grid grid-cols-4 gap-2 mt-8 animate-fade-up">
                {RATING_META.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => handleRate(r.key)}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border py-3 transition-colors ${r.className}`}
                  >
                    <span className="text-sm font-medium">{r.label}</span>
                    <span className="text-[10px] opacity-70">{r.sub}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
                Try to answer from memory before flipping.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
