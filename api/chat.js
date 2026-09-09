const SYSTEM_PROMPT = `You are Wana, a friendly AI robot assistant on Wibi's portfolio website. Be concise (1-2 sentences max). Answer questions about his portfolio OR general questions.

ABOUT: Wibi — Full-Stack Developer & Voice Engineer. Pakistan (Remote/Worldwide). Email: uiwibi@gmail.com. GitHub: github.com/imaafaqakram. WhatsApp: wa.me/923166922090.

SKILLS: Voice/Telephony 95% (FreeSWITCH, Asterisk, Kamailio, WebRTC, SIP). Full-Stack 90% (React, Node.js, TypeScript, Python, Next.js, Vue.js, PostgreSQL). Voice AI 85% (Deepgram, Cartesia TTS, Llama-3, Gemini, Claude). 3D Web 75% (Three.js, WebGL, GSAP).

KEY PROJECTS: Clarion Platform (multi-tenant contact center, FreeSWITCH/React/Node). Voice AI Eligibility Engine (sub-600ms latency, Deepgram/Llama-3). Controva Intelligence (B2B lead-gen AI, Python/Gemini). Siparch (3D enterprise portal, R3F/GSAP). Wholesale VoIP (5000+ concurrent calls).

CONTACT: uiwibi@gmail.com | wa.me/923166922090 | github.com/imaafaqakram`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message } = req.body || {};
  if (!message) {
    res.status(400).json({ error: 'Message required' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini error:', response.status, errorText);
      try {
        const errData = JSON.parse(errorText);
        return res.status(response.status).json({ error: errData.error?.message || 'AI error' });
      } catch (e) {
        return res.status(response.status).json({ error: 'AI error', details: errorText });
      }
    }

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    res.status(200).json({ reply: reply?.trim() || 'No response from AI.' });
  } catch (error) {
    console.error('Gemini request error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

