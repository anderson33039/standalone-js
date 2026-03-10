export default async function handler(req, res) {
  const apiKey = process.env.AI_API_KEY;
  
  // Use 'gemini-2.5-flash' for the best free-tier stability in 2026
  const model = "gemini-2.5-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: req.body.prompt || "Hello" }]
        }],
        // Safety settings: set to 'BLOCK_NONE' if your prompts are being filtered too strictly
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" }
        ]
      })
    });

    const data = await response.json();

    // DEBUG: If you see "No response" again, check your Vercel Logs!
    // It will show the full 'data' object from Google.
    console.log("Gemini Data:", JSON.stringify(data));

    if (data.candidates && data.candidates[0].content) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.status(200).json({ reply: aiText });
    } else if (data.error) {
      res.status(200).json({ reply: `API Error: ${data.error.message}` });
    } else {
      res.status(200).json({ reply: "Gemini blocked this prompt or returned empty." });
    }

  } catch (error) {
    res.status(500).json({ error: "Server Error: " + error.message });
  }
}