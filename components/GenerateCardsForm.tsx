"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface GeneratedCard {
  question: string;
  answer: string;
}

interface Props {
  deckTitle: string;
  onAccept: (cards: GeneratedCard[]) => void;
}

export default function GenerateCardsForm({ deckTitle, onAccept }: Props) {
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<GeneratedCard[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, deckTitle, count }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setPreview(data.cards);
      setSelected(new Set(data.cards.map((_: GeneratedCard, i: number) => i)));
    } catch {
      setError("Couldn't reach the AI service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function handleAccept() {
    if (!preview) return;
    const chosen = preview.filter((_, i) => selected.has(i));
    onAccept(chosen);
    setPreview(null);
    setNotes("");
  }

  if (preview) {
    return (
      <div className="space-y-3 animate-fade-up">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-muted)]">
            {selected.size} of {preview.length} cards selected
          </p>
          <button
            onClick={() => setPreview(null)}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] underline"
          >
            Discard &amp; edit notes
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {preview.map((c, i) => (
            <label
              key={i}
              className={`flex gap-3 rounded-lg border p-3 text-sm cursor-pointer transition-colors ${
                selected.has(i)
                  ? "border-[var(--color-spark)] bg-[var(--color-spark)]/5"
                  : "border-[var(--color-border)] opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggle(i)}
                className="mt-1 accent-[var(--color-spark)]"
              />
              <div>
                <p className="font-medium">{c.question}</p>
                <p className="text-[var(--color-text-muted)] mt-1">{c.answer}</p>
              </div>
            </label>
          ))}
        </div>
        <button
          onClick={handleAccept}
          disabled={selected.size === 0}
          className="w-full py-2.5 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          Add {selected.size} card{selected.size === 1 ? "" : "s"} to deck
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={7}
        placeholder="Paste your lecture notes, textbook paragraph, or summary here. RecallLoop will turn it into flashcards that test whether you actually understand it — not just whether you can spot the words again."
        className="w-full rounded-lg bg-[var(--color-ink)] border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:border-[var(--color-spark)] outline-none"
      />
      <div className="flex items-center gap-3">
        <label className="text-xs font-mono text-[var(--color-text-muted)] uppercase tracking-wide">
          Target cards
        </label>
        <input
          type="range"
          min={4}
          max={16}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="flex-1 accent-[var(--color-spark)]"
        />
        <span className="font-mono text-sm w-6 text-right">{count}</span>
      </div>
      {error && <p className="text-sm text-[var(--color-forgot)]">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading || notes.trim().length < 20}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Generating flashcards…
          </>
        ) : (
          <>
            <Sparkles size={16} /> Generate flashcards with AI
          </>
        )}
      </button>
    </div>
  );
}
