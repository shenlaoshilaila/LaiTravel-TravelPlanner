"use client";

import React, { useState } from "react";
import { DayPOI } from "./types";

interface AIChatBarProps {
    city: string;
    days: number;
    selectedDay: number | null;
    dayPOIs: DayPOI[];
    embedMode?: boolean; // ✅ allows inline or floating rendering
}

export default function AIChatBar({
                                      city,
                                      days,
                                      selectedDay,
                                      dayPOIs,
                                      embedMode = false,
                                  }: AIChatBarProps) {
    const [messages, setMessages] = useState<
        { sender: "user" | "assistant"; text: string }[]
    >([
        {
            sender: "assistant",
            text: "Hi! I’m your trip assistant. Ask me anything — destinations, safety, attractions, or travel advice.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    // ---------- Message send handler ----------
    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { sender: "user" as const, text: input };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    context: { city, days, selectedDay, dayPOIs },
                }),
            });

            if (!res.ok) throw new Error("Failed request");
            const data = await res.json();
            setMessages((m) => [
                ...m,
                { sender: "assistant", text: data.reply ?? "No response." },
            ]);
        } catch (err) {
            console.error(err);
            setMessages((m) => [
                ...m,
                { sender: "assistant", text: "Sorry, I couldn’t get that." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ---------- Inline (embed) mode ----------
    if (embedMode) {
        return (
            <div className="flex flex-col bg-white border rounded-lg shadow-sm h-[400px] max-w-full">
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`p-2 rounded-lg ${
                                m.sender === "user"
                                    ? "bg-blue-100 text-blue-900 self-end ml-auto w-fit"
                                    : "bg-gray-100 text-gray-800 self-start mr-auto w-fit"
                            }`}
                        >
                            {m.text}
                        </div>
                    ))}
                    {loading && (
                        <div className="text-gray-400 text-sm italic">Assistant typing…</div>
                    )}
                </div>

                <div className="border-t flex p-2 bg-gray-50">
                    <input
                        type="text"
                        value={input}
                        placeholder="Ask about destinations, routes, or tips..."
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm mr-2"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        );
    }

    // ---------- Floating mode ----------
    const [open, setOpen] = useState(false);
    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 shadow-lg hover:bg-blue-700 text-xl"
                    title="Open Trip Assistant"
                >
                    💬
                </button>
            )}

            {open && (
                <div className="fixed bottom-6 right-6 bg-white shadow-2xl rounded-lg w-96 h-[520px] flex flex-col">
                    <div className="flex items-center justify-between bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                        <h2 className="font-semibold">Trip Assistant</h2>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-sm bg-blue-500 hover:bg-blue-700 px-2 py-1 rounded"
                        >
                            Minimize
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`p-2 rounded-lg ${
                                    m.sender === "user"
                                        ? "bg-blue-100 text-blue-900 self-end ml-auto w-fit"
                                        : "bg-gray-100 text-gray-800 self-start mr-auto w-fit"
                                }`}
                            >
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="text-gray-400 text-sm italic">Assistant typing…</div>
                        )}
                    </div>

                    <div className="border-t flex p-2 bg-gray-50">
                        <input
                            type="text"
                            value={input}
                            placeholder="Ask anything about your trip..."
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm mr-2"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
