import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json(
                {
                    reply:
                        "Please include your travel query (e.g., 'Hangzhou, China 10/4–10/5').",
                },
                { status: 400 }
            );
        }

        // ✅ Verify API key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing OPENAI_API_KEY in environment variables.");
            return NextResponse.json(
                { reply: "Server configuration error: missing API key." },
                { status: 500 }
            );
        }

        // ✅ Create OpenAI client
        const openai = new OpenAI({ apiKey });

        // ✅ Call the model with an improved system prompt
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly and helpful travel assistant.

When the user mentions any city name (e.g., Hangzhou, Paris, Tokyo),
ALWAYS include the country name for clarity — for example:
  - "Hangzhou, China"
  - "Paris, France"
  - "New York, USA"

If the user provides only a city without specifying the country,
automatically infer and append the correct country.

When generating trip itineraries, each day's "city" field must include
both the city and country (e.g., "Kyoto, Japan" or "Milan, Italy").

Respond concisely and clearly, using short, friendly explanations when needed.
If generating a plan, structure it clearly with days, POIs, and travel hints.
          `,
                },
                {
                    role: "user",
                    content: message,
                },
            ],
        });

        // ✅ Extract AI response
        const reply =
            completion.choices[0]?.message?.content ??
            "Sorry, I couldn’t generate a response this time.";

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
