"use client";

import { useState } from "react";

interface Props {
  initialQuestion?: string;
  initialAnswer?: string;
  onSave: (question: string, answer: string) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function CardEditor({
  initialQuestion = "",
  initialAnswer = "",
  onSave,
  onCancel,
  submitLabel = "Add card",
}: Props) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState(initialAnswer);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!question.trim() || !answer.trim()) return;
        onSave(question.trim(), answer.trim());
      }}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3"
    >
      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-text-muted)]">
          Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg bg-[var(--color-ink)] border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:border-[var(--color-spark)] outline-none"
          placeholder="What triggers X?"
        />
      </div>
      <div>
        <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-text-muted)]">
          Answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg bg-[var(--color-ink)] border border-[var(--color-border)] px-3 py-2 text-sm resize-none focus:border-[var(--color-spark)] outline-none"
          placeholder="Because..."
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-spark)] text-[var(--color-ink)] font-medium hover:opacity-90 transition-opacity"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
