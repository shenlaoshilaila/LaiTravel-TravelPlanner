// components/AIChatBar.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { POI } from "./types";

type Props = {
    city: string;
    days: number;
    selectedDay: number | null;
    dayPOIs: Array<{ day: number; pois: POI[] }>;
};

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

export default function AIChatBar({ city, days, selectedDay, dayPOIs }: Props) {
    const [open, setOpen] = useState(true);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            role: "assistant",
            content:
                "Hi! I’m your trip assistant. Ask me to suggest POIs, optimize routes, or plan your day.",
        },
    ]);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Minimal context sent with each query
    const context = useMemo(() => {
        const selected = selectedDay ?? 1;
        const today = dayPOIs.find((d) => d.day === selected)?.pois ?? [];
        const todayList = today.map((p, i) => `${i + 1}. ${p.name}`).join("\n");
        return `City: ${city}
Total days: ${days}
Selected day: ${selected}
Today's POIs:
${todayList || "(none yet)"}\n`;
    }, [city, days, selectedDay, dayPOIs]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    async function send() {
        if (!input.trim()) return;
        const userMsg: ChatMsg = { role: "user", content: input.trim() };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/ai-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a concise travel planning assistant. Give concrete, step-by-step tips and list 3–6 POIs when asked. Prefer walkable clusters and logical route order. If the user has POIs already, optimize sequence and add nearby food options.",
                        },
                        { role: "system", content: `Current plan context:\n${context}` },
                        ...messages,
                        userMsg,
                    ].map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            if (!res.ok) throw new Error(await res.text());
            const data = (await res.json()) as { reply: string };
            setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
        } catch (e: any) {
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "Sorry, I couldn’t reach the planner AI." },
            ]);
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
        }
    }

    return (
        <div
            className={`fixed right-4 bottom-4 z-40 w-[360px] max-w-[92vw] transition-transform ${
                open ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
            }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-3 py-2 text-white shadow-lg">
                <span className="font-semibold">Trip Assistant</span>
                <button
                    className="rounded bg-white/20 px-2 py-1 text-sm hover:bg-white/30"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? "Minimize" : "Open"}
                </button>
            </div>

            {/* Body */}
            <div className="rounded-b-xl border border-blue-200 bg-white shadow-xl">
                <div className="h-[360px] overflow-y-auto px-3 py-3 space-y-3">
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`whitespace-pre-wrap text-sm leading-relaxed ${
                                m.role === "assistant" ? "text-gray-900" : "text-blue-700"
                            }`}
                        >
                            <strong className="mr-1">
                                {m.role === "assistant" ? "Assistant:" : "You:"}
                            </strong>
                            {m.content}
                        </div>
                    ))}
                    {loading && <div className="text-sm text-gray-500">Thinking…</div>}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t p-2">
          <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder="Suggest a 1-day route with lunch near the 798 Art Zone…"
              className="w-full resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
                    <div className="mt-2 flex justify-end">
                        <button
                            onClick={send}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
