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
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly AI travel planner.
The user will tell you cities and dates for their trip.

When generating itineraries, always include both the city and the country
in the "city" field (e.g., "Hangzhou, China", "Kyoto, Japan", "Paris, France").

Return only valid JSON in this exact format:
{
  "dayPOIs": [
    {
      "day": 1,
      "date": "2025-10-01",
      "city": "Hangzhou, China",
      "pois": ["West Lake", "Lingyin Temple"]
    },
    {
      "day": 2,
      "date": "2025-10-02",
      "city": "Hangzhou, China",
      "pois": ["Xixi National Wetland Park", "Leifeng Pagoda"]
    }
  ]
}
Do not include any text outside the JSON.
          `,
                },
                { role: "user", content: query },
            ],
            response_format: { type: "json_object" }, // ✅ ensures valid JSON
        });

        // ✅ Parse OpenAI response
        const content = completion.choices[0]?.message?.content || "{}";
        const data = JSON.parse(content);

        // ✅ Return JSON result to frontend
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("AI Itinerary error:", error);
        return NextResponse.json(
            { error: "AI itinerary generation failed", details: error.message },
            { status: 500 }
        );
    }
}
