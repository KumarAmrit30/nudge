"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Product } from "@/lib/types";
import {
  RecommendationCards,
  type WhyThis,
} from "@/components/RecommendationCards";

type ChatRole = "user" | "assistant";

type VisibleMessage = {
  role: ChatRole;
  text: string;
  followUp?: boolean;
  products?: Product[];
  why?: WhyThis[];
};

function sessionId(): string {
  const key = "nudge-buyer-session";
  const existing = sessionStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const created = crypto.randomUUID();
  sessionStorage.setItem(key, created);
  return created;
}

export function BuyerChat() {
  const idRef = useRef("");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<VisibleMessage[]>([]);

  function getSessionId(): string {
    if (!idRef.current) {
      idRef.current = sessionId();
    }
    return idRef.current;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) {
      return;
    }
    const id = getSessionId();

    const nextMessages: VisibleMessage[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/buyer/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: id,
          messages: nextMessages.map((message) => ({
            role: message.role,
            text: message.text,
            followUp: message.followUp,
          })),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        intro?: string;
        followUp?: boolean;
        products?: Product[];
        why?: WhyThis[];
      };

      if (!response.ok) {
        setError(
          data.error ??
            "The assistant is unavailable. You can still browse the product catalog.",
        );
        return;
      }

      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text: data.intro ?? "",
          followUp: data.followUp,
          products: data.products ?? [],
          why: data.why ?? [],
        },
      ]);
    } catch {
      setError("The assistant is unavailable. You can still browse the product catalog.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="space-y-4">
        {messages.length === 0 ? (
          <li className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-600">
            Describe what you need. Try “laptop under ₹80,000 with 16 GB RAM”.
            I search the merchant catalog and never invent price or stock.
          </li>
        ) : null}
        {messages.map((message, index) => (
          <li key={`${message.role}-${index}`} className="space-y-3">
            <div
              className={
                message.role === "user"
                  ? "ml-auto max-w-xl rounded-xl bg-zinc-900 px-4 py-3 text-white"
                  : "max-w-2xl rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-800"
              }
            >
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{message.text}</p>
            </div>
            {message.role === "assistant" ? (
              <RecommendationCards
                products={message.products ?? []}
                why={message.why ?? []}
              />
            ) : null}
          </li>
        ))}
      </ol>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="buyer-message">
          Message
        </label>
        <input
          id="buyer-message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="What do you need?"
          className="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2"
          disabled={pending}
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}
