"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Deck, Rating } from "./types";
import { loadDecks, saveDecks } from "./storage";
import { createFreshCard, scheduleNextReview } from "./srs";

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount (client only) —
    // intentionally synchronous, this isn't syncing with an external
    // system on an ongoing basis.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDecks(loadDecks());
    setReady(true);
  }, []);

  const persist = useCallback((next: Deck[]) => {
    setDecks(next);
    saveDecks(next);
  }, []);

  const createDeck = useCallback(
    (title: string, description: string, cards: Card[] = []) => {
      const deck: Deck = {
        id: crypto.randomUUID(),
        title,
        description,
        createdAt: new Date().toISOString(),
        cards,
      };
      persist([deck, ...decks]);
      return deck;
    },
    [decks, persist]
  );

  const deleteDeck = useCallback(
    (deckId: string) => {
      persist(decks.filter((d) => d.id !== deckId));
    },
    [decks, persist]
  );

  const addCards = useCallback(
    (deckId: string, newCards: { question: string; answer: string }[]) => {
      persist(
        decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: [
                  ...d.cards,
                  ...newCards.map((c) => createFreshCard(c.question, c.answer)),
                ],
              }
            : d
        )
      );
    },
    [decks, persist]
  );

  const updateCard = useCallback(
    (deckId: string, cardId: string, question: string, answer: string) => {
      persist(
        decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) =>
                  c.id === cardId ? { ...c, question, answer } : c
                ),
              }
            : d
        )
      );
    },
    [decks, persist]
  );

  const deleteCard = useCallback(
    (deckId: string, cardId: string) => {
      persist(
        decks.map((d) =>
          d.id === deckId
            ? { ...d, cards: d.cards.filter((c) => c.id !== cardId) }
            : d
        )
      );
    },
    [decks, persist]
  );

  const reviewCard = useCallback(
    (deckId: string, cardId: string, rating: Rating) => {
      persist(
        decks.map((d) =>
          d.id === deckId
            ? {
                ...d,
                cards: d.cards.map((c) =>
                  c.id === cardId ? scheduleNextReview(c, rating) : c
                ),
              }
            : d
        )
      );
    },
    [decks, persist]
  );

  const replaceAll = useCallback(
    (next: Deck[]) => {
      persist(next);
    },
    [persist]
  );

  return {
    decks,
    ready,
    createDeck,
    deleteDeck,
    addCards,
    updateCard,
    deleteCard,
    reviewCard,
    replaceAll,
  };
}
