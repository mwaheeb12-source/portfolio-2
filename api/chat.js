const https = require('https');

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

  const payload = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } }
  });

  try {
    const reply = await new Promise((resolve, reject) => {
      const apiReq = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, apiRes => {
        let apiBody = '';
        apiRes.on('data', d => apiBody += d);
        apiRes.on('end', () => {
          if (apiRes.statusCode !== 200) {
            console.error('Gemini error:', apiBody);
            try {
              const data = JSON.parse(apiBody);
              reject(new Error(data.error?.message || 'AI error'));
            } catch (e) {
              reject(new Error('AI error'));
            }
            return;
          }
          try {
            const data = JSON.parse(apiBody);
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            resolve(text);
          } catch (e) {
            reject(new Error('Failed to parse response'));
          }
        });
      });

      apiReq.on('error', reject);
      apiReq.write(payload);
      apiReq.end();
    });

    res.status(200).json({ reply: reply?.trim() || 'No response from AI.' });
  } catch (error) {
    console.error('Gemini request error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
