import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json(
                { reply: "Please include your travel query (e.g., 'Hangzhou, China 10/4–10/5')." },
                { status: 400 }
            );
        }

        // ✅ Require city + country (e.g., has a comma or the word 'China')
        const cityFormatValid = /[,，]|(china|usa|japan|france|italy|spain|germany|canada|uk|australia)/i.test(
            message
        );

        if (!cityFormatValid) {
            return NextResponse.json(
                {
                    reply:
                        "Please include both the city and country in your request — for example: 'Hangzhou, China 10/4–10/5'.",
                },
                { status: 400 }
            );
        }

        // ✅ Verify OpenAI API key
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

        // ✅ Call the model
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a friendly and helpful travel assistant. Always give responses in a clear, concise way. When asked for trip planning, provide structured travel day plans and POIs per day.",
                },
                { role: "user", content: message },
            ],
            temperature: 0.7,
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
