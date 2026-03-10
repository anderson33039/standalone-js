export default async function handler(req, res) {
  // 1. SET CORS HEADERS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all websites to call this
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // 2. Handle the "Preflight" request (The browser's "Is it okay?" check)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. YOUR EXISTING LOGIC
  const apiKey = process.env.AI_API_KEY;
  // Using gemini-2.0-flash or gemini-1.5-flash (stable)
  const model = "gemini-2.5-flash"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // 1. MUST be at the top level
        // 2. MUST use "parts" inside
        system_instruction: {
          role: "system", // Optional but helpful
          parts: [{ 
            text: "Your name is Yurikai. You were created by jaycee. You are a helpful assistant." 
          }]
        },
        contents: [{
          role: "user",
          parts: [{ text: req.body.prompt || "Hello" }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();

    // If Google returns an error, send it back so you can see it in the browser console
    if (data.error) {
      return res.status(200).json({ reply: `Gemini Error: ${data.error.message}` });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Empty response from AI";
    res.status(200).json({ reply: aiText });

  } catch (error) {
    res.status(500).json({ error: "Server Crash: " + error.message });
  }
}