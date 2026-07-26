import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert study coach who converts raw lecture notes or textbook material into high-quality active-recall flashcards for spaced-repetition learning.

Rules:
- Extract only the core concepts, definitions, cause-effect relationships, comparisons, and facts a student actually needs to understand and remember. Ignore filler, examples that teach nothing new, and formatting artifacts from the source.
- Write each question so it tests understanding or recall, never simple word-matching lifted verbatim from the notes (no fill-in-the-blank copied straight from the text).
- Vary question types across the set: definitions, "why/how" reasoning, comparisons, application to a new scenario, and cause-effect.
- Keep answers concise (1-3 sentences), correct, and self-contained, so a student can grade their own recall against it without re-reading the notes.
- Produce as many cards as the distinct content supports, between the given minimum and maximum. Do not pad with trivial or duplicate questions just to hit a count. Do not invent facts that are not in, or reasonably implied by, the notes.
- Return ONLY valid JSON. No prose, no markdown code fences, no commentary. The response must be exactly this shape, as an object with a "cards" key:
{"cards": [{"question": "string", "answer": "string"}]}`;

export async function POST(req: NextRequest) {
  try {
    const { notes, deckTitle, count } = await req.json();

    if (!notes || typeof notes !== "string" || notes.trim().length < 20) {
      return NextResponse.json(
        { error: "Please paste at least a few sentences of notes." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server is missing GROQ_API_KEY." },
        { status: 500 }
      );
    }

    const targetCount = Math.min(Math.max(Number(count) || 8, 3), 20);
    const min = Math.max(3, targetCount - 3);
    const max = targetCount + 3;

    const userMessage = `Deck topic: ${deckTitle || "Untitled deck"}
Minimum cards: ${min}
Maximum cards: ${max}

Notes:
"""
${notes.slice(0, 12000)}
"""`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.4,
        max_tokens: 2048,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error("Groq API error", groqRes.status, errText);
      return NextResponse.json(
        { error: "The AI service couldn't generate cards right now. Please try again." },
        { status: 502 }
      );
    }

    const data = await groqRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";

    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "");

    let parsed: { cards?: { question: string; answer: string }[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "The AI response could not be parsed. Please try again." },
        { status: 502 }
      );
    }

    const cards = parsed.cards;

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: "No flashcards could be generated from these notes." },
        { status: 502 }
      );
    }

    const clean = cards
      .filter(
        (c) =>
          c &&
          typeof c.question === "string" &&
          typeof c.answer === "string" &&
          c.question.trim() &&
          c.answer.trim()
      )
      .slice(0, max);

    return NextResponse.json({ cards: clean });
  } catch (err) {
    console.error("generate-cards error", err);
    return NextResponse.json(
      { error: "Something went wrong generating flashcards." },
      { status: 500 }
    );
  }
}
