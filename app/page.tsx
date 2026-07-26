"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDecks } from "@/lib/useDecks";
import { isDue, isMastered, isNew } from "@/lib/srs";
import DecayCurve from "@/components/DecayCurve";
import GenerateCardsForm from "@/components/GenerateCardsForm";
import { Plus, Brain, Download, Upload, Layers } from "lucide-react";
import { exportDecks } from "@/lib/storage";

export default function Dashboard() {
  const router = useRouter();
  const { decks, ready, createDeck, deleteDeck, addCards, replaceAll } = useDecks();
  const [creating, setCreating] = useState(false);
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pendingDeckId, setPendingDeckId] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const totals = useMemo(() => {
    const allCards = decks.flatMap((d) => d.cards);
    return {
      due: allCards.filter((c) => isDue(c)).length,
      total: allCards.length,
      mastered: allCards.filter(isMastered).length,
      newCards: allCards.filter(isNew).length,
    };
  }, [decks]);

  function startCreate() {
    setCreating(true);
    setTitle("");
    setDescription("");
    setPendingDeckId(null);
  }

  function handleTitleConfirmed() {
    if (!title.trim()) return;
    const deck = createDeck(title.trim(), description.trim());
    setPendingDeckId(deck.id);
  }

  function handleCardsGenerated(cards: { question: string; answer: string }[]) {
    if (!pendingDeckId) return;
    addCards(pendingDeckId, cards);
    setCreating(false);
    router.push(`/deck/${pendingDeckId}`);
  }

  function handleExport() {
    const blob = new Blob([exportDecks()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recallloop-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        replaceAll(parsed);
      } catch {
        alert("That file doesn't look like a RecallLoop backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-[var(--color-spark)]" />
          <span className="font-display text-lg">RecallLoop</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            title="Export backup"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => fileInput.current?.click()}
            title="Import backup"
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
          >
            <Upload size={18} />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </header>

      <section className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-70">
          <DecayCurve />
        </div>
        <div className="relative px-8 py-12 sm:px-12 sm:py-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-spark)] mb-3">
            Spaced repetition, done for you
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.05] max-w-xl mb-4">
            Every memory decays.<br />
            <span className="italic text-[var(--color-text-muted)]">RecallLoop</span> catches yours before it does.
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-md mb-8">
            Paste your notes. An AI turns them into flashcards that actually test
            understanding. A scheduler brings each one back right when you&apos;re
            about to forget it.
          </p>
          {ready && (
            <div className="flex flex-wrap gap-6">
              <Stat value={totals.due} label="due right now" accent />
              <Stat value={totals.total} label="total cards" />
              <Stat value={totals.mastered} label="mastered" />
              <Stat value={totals.newCards} label="not yet studied" />
            </div>
          )}
        </div>
      </section>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Layers size={18} className="text-[var(--color-text-muted)]" />
          Your decks
        </h2>
        <button
          onClick={startCreate}
          className="flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> New deck
        </button>
      </div>

      {ready && decks.length === 0 && !creating && (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center text-[var(--color-text-muted)]">
          No decks yet. Create one and paste in a page of notes to see the AI
          feature in action.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {decks.map((deck) => {
          const due = deck.cards.filter((c) => isDue(c)).length;
          const mastered = deck.cards.filter(isMastered).length;
          const pct = deck.cards.length
            ? Math.round((mastered / deck.cards.length) * 100)
            : 0;
          return (
            <Link
              key={deck.id}
              href={`/deck/${deck.id}`}
              className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-spark)] transition-colors animate-fade-up"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg leading-snug">{deck.title}</h3>
                {due > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--color-spark)]/15 text-[var(--color-spark)] shrink-0 ml-2">
                    {due} due
                  </span>
                )}
              </div>
              {deck.description && (
                <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs font-mono text-[var(--color-text-muted)]">
                <span>{deck.cards.length} cards</span>
                <span>{pct}% mastered</span>
              </div>
              <div className="mt-2 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-mastery)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Delete "${deck.title}"? This cannot be undone.`)) {
                    deleteDeck(deck.id);
                  }
                }}
                className="mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-forgot)] transition-colors"
              >
                Delete deck
              </button>
            </Link>
          );
        })}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-[var(--color-ink)]/90 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 max-h-[90vh] overflow-y-auto">
            {!pendingDeckId ? (
              <>
                <h3 className="font-display text-xl mb-4">New deck</h3>
                <div className="space-y-3 mb-4">
                  <input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Deck title, e.g. Cell Biology — Chapter 4"
                    className="w-full rounded-lg bg-[var(--color-ink)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-spark)] outline-none"
                  />
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    className="w-full rounded-lg bg-[var(--color-ink)] border border-[var(--color-border)] px-3 py-2 text-sm focus:border-[var(--color-spark)] outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setCreating(false)}
                    className="px-3 py-1.5 text-sm rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTitleConfirmed}
                    disabled={!title.trim()}
                    className="px-4 py-1.5 text-sm rounded-lg bg-[var(--color-spark)] text-[var(--color-ink)] font-medium disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl">{title}</h3>
                  <div className="flex text-xs rounded-full border border-[var(--color-border)] overflow-hidden">
                    <button
                      onClick={() => setMode("ai")}
                      className={`px-3 py-1 ${mode === "ai" ? "bg-[var(--color-spark)] text-[var(--color-ink)]" : "text-[var(--color-text-muted)]"}`}
                    >
                      AI generate
                    </button>
                    <button
                      onClick={() => setMode("manual")}
                      className={`px-3 py-1 ${mode === "manual" ? "bg-[var(--color-spark)] text-[var(--color-ink)]" : "text-[var(--color-text-muted)]"}`}
                    >
                      Skip
                    </button>
                  </div>
                </div>
                {mode === "ai" ? (
                  <GenerateCardsForm deckTitle={title} onAccept={handleCardsGenerated} />
                ) : (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Deck created. You can add cards manually from the deck page.
                  </p>
                )}
                {mode === "manual" && (
                  <button
                    onClick={() => {
                      setCreating(false);
                      router.push(`/deck/${pendingDeckId}`);
                    }}
                    className="mt-4 w-full py-2.5 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium"
                  >
                    Go to deck
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div>
      <p
        className={`font-display text-3xl ${accent ? "text-[var(--color-spark)]" : ""}`}
      >
        {value}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide font-mono">
        {label}
      </p>
    </div>
  );
}
