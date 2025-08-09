import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: true, message: "Method not allowed" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: true, message: "Missing OpenAI API key" });
    }

    const { prompt } = req.body || {};
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: true, message: "Prompt is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // make sure this model is available in your account
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const botResponse = completion.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      error: false,
      response: botResponse.trim(),
    });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      error: true,
      message: "OpenAI API request failed",
      details: error?.message || "Unknown error",
    });
  }
}
