"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDecks } from "@/lib/useDecks";
import { isDue, isMastered } from "@/lib/srs";
import CardEditor from "@/components/CardEditor";
import GenerateCardsForm from "@/components/GenerateCardsForm";
import StudySession from "@/components/StudySession";
import { ArrowLeft, Plus, Sparkles, Trash2, Pencil, PlayCircle } from "lucide-react";

export default function DeckPage() {
  const params = useParams();
  const deckId = params.id as string;
  const { decks, ready, addCards, updateCard, deleteCard, reviewCard } = useDecks();

  const deck = decks.find((d) => d.id === deckId);

  const [tab, setTab] = useState<"cards" | "ai">("cards");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [studying, setStudying] = useState(false);

  const stats = useMemo(() => {
    if (!deck) return null;
    return {
      due: deck.cards.filter((c) => isDue(c)).length,
      mastered: deck.cards.filter(isMastered).length,
    };
  }, [deck]);

  if (ready && !deck) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-[var(--color-text-muted)] mb-4">This deck doesn&apos;t exist (or your browser storage was cleared).</p>
        <Link href="/" className="text-[var(--color-spark)] hover:underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  if (!deck) return null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6"
      >
        <ArrowLeft size={16} /> All decks
      </Link>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl mb-1">{deck.title}</h1>
          {deck.description && (
            <p className="text-[var(--color-text-muted)]">{deck.description}</p>
          )}
        </div>
        {stats && stats.due > 0 && (
          <button
            onClick={() => setStudying(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            <PlayCircle size={18} /> Study {stats.due} due
          </button>
        )}
      </div>

      <div className="flex gap-4 text-xs font-mono text-[var(--color-text-muted)] mb-8">
        <span>{deck.cards.length} cards</span>
        <span>{stats?.mastered ?? 0} mastered</span>
        <span>{stats?.due ?? 0} due now</span>
      </div>

      <div className="flex gap-1 mb-4 border-b border-[var(--color-border)]">
        <TabButton active={tab === "cards"} onClick={() => setTab("cards")}>
          Cards
        </TabButton>
        <TabButton active={tab === "ai"} onClick={() => setTab("ai")}>
          <Sparkles size={14} className="inline mr-1 -mt-0.5" />
          Generate with AI
        </TabButton>
      </div>

      {tab === "ai" && (
        <div className="mb-8">
          <GenerateCardsForm
            deckTitle={deck.title}
            onAccept={(cards) => {
              addCards(deck.id, cards);
              setTab("cards");
            }}
          />
        </div>
      )}

      {tab === "cards" && (
        <div className="space-y-3">
          {adding && (
            <CardEditor
              onSave={(q, a) => {
                addCards(deck.id, [{ question: q, answer: a }]);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          )}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-spark)] hover:text-[var(--color-text)] transition-colors"
            >
              <Plus size={16} /> Add a card manually
            </button>
          )}

          {deck.cards.length === 0 && !adding && (
            <p className="text-center text-[var(--color-text-muted)] py-10">
              No cards yet. Add one manually or switch to &ldquo;Generate with AI&rdquo;
              above and paste in some notes.
            </p>
          )}

          {deck.cards
            .slice()
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((card) =>
              editingId === card.id ? (
                <CardEditor
                  key={card.id}
                  initialQuestion={card.question}
                  initialAnswer={card.answer}
                  submitLabel="Save"
                  onSave={(q, a) => {
                    updateCard(deck.id, card.id, q, a);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={card.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm mb-1">{card.question}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">{card.answer}</p>
                    <div className="flex gap-3 mt-2 text-[10px] font-mono text-[var(--color-text-muted)] uppercase tracking-wide">
                      <span className={isDue(card) ? "text-[var(--color-spark)]" : ""}>
                        {isDue(card) ? "Due now" : `Due ${new Date(card.dueDate).toLocaleDateString()}`}
                      </span>
                      <span>{isMastered(card) ? "Mastered" : `Ease ${card.easeFactor}`}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setEditingId(card.id)}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-raised)] transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this card?")) deleteCard(deck.id, card.id);
                      }}
                      className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-forgot)] hover:bg-[var(--color-surface-raised)] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
        </div>
      )}

      {studying && (
        <StudySession
          deckTitle={deck.title}
          cards={deck.cards}
          onRate={(cardId, rating) => reviewCard(deck.id, cardId, rating)}
          onClose={() => setStudying(false)}
        />
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm border-b-2 transition-colors ${
        active
          ? "border-[var(--color-spark)] text-[var(--color-text)]"
          : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}
