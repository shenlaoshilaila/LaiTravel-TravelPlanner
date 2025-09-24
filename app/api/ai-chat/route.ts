// app/api/ai-chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // keep this on the server

export async function POST(req: NextRequest) {
    try {
        const { messages, model, temperature, top_p, ...rest } = await req.json();

        const apiKey = process.env.OPENAI_API_KEY;
        const baseURL =
            process.env.OPENAI_BASE_URL?.replace(/\/+$/, "") || "https://api.openai.com/v1";
        const defaultModel = process.env.OPENAI_MODEL || "gpt-4o-mini";

        if (!apiKey) {
            return NextResponse.json(
                { reply: "Missing OPENAI_API_KEY on server." },
                { status: 500 }
            );
        }

        // Optional: set a request timeout so the route can’t hang forever
        const ac = new AbortController();
        const t = setTimeout(() => ac.abort(), 60_000); // 60s

        const resp = await fetch(`${baseURL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,            // <-- required
                // If your provider needs extra headers, add them here:
                // "OpenAI-Organization": process.env.OPENAI_ORG_ID ?? "",
                // "OpenAI-Project": process.env.OPENAI_PROJECT_ID ?? "",
            },
            body: JSON.stringify({
                model: model ?? defaultModel,
                messages,                         // [{ role: "user"|"system"|"assistant", content: string }]
                temperature: temperature ?? 0.4,
                top_p,
                ...rest,                          // pass through any other OpenAI-compatible params
            }),
            signal: ac.signal,
        }).finally(() => clearTimeout(t));

        const text = await resp.text(); // read once for easier debugging

        if (!resp.ok) {
            // Bubble up provider errors with status code for visibility
            return NextResponse.json(
                { reply: `Provider error (${resp.status}): ${text}` },
                { status: 500 }
            );
        }

        const data = JSON.parse(text);
        const reply = data?.choices?.[0]?.message?.content ?? "No response.";
        return NextResponse.json({ reply });
    } catch (err: any) {
        const msg = err?.name === "AbortError" ? "Upstream request timed out." : String(err?.message ?? err);
        console.error("AI route error:", err);
        return NextResponse.json(
            { reply: `Server error in /api/ai-chat: ${msg}` },
            { status: 500 }
        );
    }
}
