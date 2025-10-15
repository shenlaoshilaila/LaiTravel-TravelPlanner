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

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing OPENAI_API_KEY in environment variables.");
            return NextResponse.json(
                { reply: "Server configuration error: missing API key." },
                { status: 500 }
            );
        }

        const openai = new OpenAI({ apiKey });

        // ✅ Detect if user provided a country name
        const hasCountry =
            /[,，]/.test(message) ||
            /(china|japan|usa|france|italy|spain|germany|canada|uk|united kingdom|australia)/i.test(
                message
            );

        // ✅ If no country detected — ask user to clarify before generating plan
        if (!hasCountry) {
            return NextResponse.json({
                reply: `I noticed you mentioned a city but not its country. 🌍  
Could you please tell me which country it’s in?  
For example: "Hangzhou, China 10/4–10/5"`,
            });
        }

        // ✅ Otherwise, generate the full travel plan
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly and helpful travel assistant.

When the user mentions a city, ALWAYS include the full location with the country name.
If the user has already given the country, continue normally.
If they haven't, politely ask which country it is in before planning anything.

When generating itineraries, make sure each day's city field includes the country
(e.g., "Hangzhou, China" or "Kyoto, Japan"). Provide concise, friendly responses.`,
                },
                { role: "user", content: message },
            ],
        });

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
