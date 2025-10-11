import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `
You are a friendly travel planning AI. 
Ask for clarification if the user forgets to give city names or dates. 
When they do, respond in this JSON format:
{
  "dayPOIs": [
    {"day": 1, "date": "2025-10-01", "city": "Hangzhou", "pois": ["West Lake", "Lingyin Temple"]}
  ]
}
          `,
                },
                { role: "user", content: query },
            ],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(completion.choices[0].message?.content || "{}");
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI itinerary generation failed" });
    }
}
