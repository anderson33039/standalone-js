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
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt || "Hello" }] }]
      })
    });

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    
    res.status(200).json({ reply: aiText });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}