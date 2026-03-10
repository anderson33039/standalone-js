export default async function handler(req, res) {
  // 1. Get your key from Vercel Environment Variables
  const apiKey = process.env.AI_API_KEY;
  const model = "gemini-2.5-flash"; // The free tier favorite

  // 2. Format the request for Google's API
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: req.body.prompt }] // Gemini uses 'contents' and 'parts'
        }]
      })
    });

    const data = await response.json();

    // 3. Send the AI's text back to your terminal/app
    // Gemini's response path is: candidates[0].content.parts[0].text
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
    
    res.status(200).json({ reply: aiText });

  } catch (error) {
    res.status(500).json({ error: "Failed to connect to Gemini" });
  }
}