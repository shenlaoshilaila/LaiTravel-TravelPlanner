import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ reply: "Missing message content." }, { status: 400 });
        }

        // ✅ Make sure your API key exists
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("❌ OPENAI_API_KEY is missing in Vercel environment.");
            return NextResponse.json(
                { reply: "Server configuration error: missing API key." },
                { status: 500 }
            );
        }

        // ✅ Create OpenAI client securely
        const openai = new OpenAI({ apiKey });

        // ✅ Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a friendly and helpful travel assistant." },
                { role: "user", content: message },
            ],
        });

        const reply =
            completion.choices[0]?.message?.content ?? "Sorry, I couldn’t generate a response.";

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("❌ Error in /api/ai-chat route:", error);
        return NextResponse.json(
            {
                reply:
                    "Internal Server Error: " +
                    (error.message || "Please check server logs for details."),
            },
            { status: 500 }
        );
    }
}
