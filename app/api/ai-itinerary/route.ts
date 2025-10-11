import { NextResponse } from "next/server";
import OpenAI from "openai";

// ✅ Make sure OPENAI_API_KEY exists in your .env.local file
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json(
                { error: "Missing query in request body" },
                { status: 400 }
            );
        }

        // ✅ Call OpenAI to generate itinerary suggestions
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly AI travel planner. The user will tell you cities and dates.
Return a JSON structure in this format:
{
  "dayPOIs": [
    {
      "day": 1,
      "date": "2025-10-01",
      "city": "Hangzhou",
      "pois": ["West Lake", "Lingyin Temple"]
    }
  ]
}
          `,
                },
                { role: "user", content: query },
            ],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message?.content || "{}";
        const data = JSON.parse(content);

        return NextResponse.json(data);
    } catch (error) {
        console.error("AI Itinerary error:", error);
        return NextResponse.json(
            { error: "AI itinerary generation failed" },
            { status: 500 }
        );
    }
}
