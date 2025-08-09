import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json"); // Force JSON response

  if (req.method !== "POST") {
    return res.status(405).json({ error: true, message: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: true, message: "Prompt is required" });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const botResponse = completion.data.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      error: false,
      response: botResponse.trim(),
    });
  } catch (error) {
    console.error("OpenAI API error:", error.response?.data || error.message);

    return res.status(500).json({
      error: true,
      message: "OpenAI API request failed",
      details: error.response?.data || error.message,
    });
  }
}
