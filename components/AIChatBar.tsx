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

    // --- resizable state
    const [size, setSize] = useState({ width: 480, height: 520 });

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
                                "You are a concise travel planning assistant. Give concrete, step-by-step tips and list 3–6 POIs when asked.",
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
        } catch (e) {
            setMessages((m) => [
                ...m,
                { role: "assistant", content: "Sorry, I couldn’t reach the planner AI." },
            ]);
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

    // --- drag logic for resizing
    const startResize = (direction: "left" | "top") => (e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        function onMouseMove(ev: MouseEvent) {
            if (direction === "left") {
                const newWidth = startWidth + (startX - ev.clientX);
                if (newWidth > 350 && newWidth < 900) {
                    setSize((s) => ({ ...s, width: newWidth }));
                }
            } else if (direction === "top") {
                const newHeight = startHeight + (startY - ev.clientY);
                if (newHeight > 300 && newHeight < 1000) {
                    setSize((s) => ({ ...s, height: newHeight }));
                }
            }
        }

        function onMouseUp() {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    return (
        <div
            className={`fixed right-4 bottom-4 z-40 transition-transform ${
                open ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
            }`}
            style={{
                width: size.width,
                height: size.height,
            }}
        >
            {/* resize handles */}
            <div
                onMouseDown={startResize("left")}
                className="absolute top-0 left-0 h-full w-1 cursor-ew-resize bg-transparent"
            />
            <div
                onMouseDown={startResize("top")}
                className="absolute top-0 left-0 w-full h-1 cursor-ns-resize bg-transparent"
            />

            {/* Header */}
            <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-3 py-2 text-white shadow-lg text-xl font-bold">
                <span>Trip Assistant</span>
                <button
                    className="rounded bg-white/20 px-3 py-1 text-lg hover:bg-white/30"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? "Minimize" : "Open"}
                </button>
            </div>

            {/* Body */}
            <div className="flex h-[calc(100%-48px)] flex-col rounded-b-xl border border-blue-200 bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-lg leading-relaxed">
                    {messages.map((m, idx) => (
                        <div
                            key={idx}
                            className={`whitespace-pre-wrap ${
                                m.role === "assistant" ? "text-gray-900" : "text-blue-700"
                            }`}
                        >
                            <strong className="mr-1">
                                {m.role === "assistant" ? "Assistant:" : "You:"}
                            </strong>
                            {m.content}
                        </div>
                    ))}
                    {loading && <div className="text-lg text-gray-500">Thinking…</div>}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t p-3">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        rows={2}
                        placeholder="Suggest a 1-day route with lunch near the 798 Art Zone…"
                        className="w-full resize-none rounded-lg border px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={send}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-2 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
