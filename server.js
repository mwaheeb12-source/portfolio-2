import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load API keys from .env.local
const envPath = path.join(__dirname, '.env.local');
let GEMINI_API_KEY = '';
let CARTESIA_API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const geminiMatch = envContent.match(/GEMINI_API_KEY\s*=\s*"?([^"\n]+)"?/);
  if (geminiMatch) GEMINI_API_KEY = geminiMatch[1].trim();
  
  const cartesiaMatch = envContent.match(/CARTESIA_API_KEY\s*=\s*"?([^"\n]+)"?/);
  if (cartesiaMatch) CARTESIA_API_KEY = cartesiaMatch[1].trim();
}

console.log('Gemini API Key loaded:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'MISSING');
console.log('Cartesia API Key loaded:', CARTESIA_API_KEY ? CARTESIA_API_KEY.substring(0, 10) + '...' : 'MISSING');

const SYSTEM_PROMPT = `You are Wana, a friendly AI robot assistant on Wibi's portfolio website. Be concise (1-2 sentences max). Answer questions about his portfolio OR general questions.

ABOUT: Wibi — Full-Stack Developer & Voice Engineer. Pakistan (Remote/Worldwide). Email: uiwibi@gmail.com. GitHub: github.com/imaafaqakram. WhatsApp: wa.me/923166922090.

SKILLS: Voice/Telephony 95% (FreeSWITCH, Asterisk, Kamailio, WebRTC, SIP). Full-Stack 90% (React, Node.js, TypeScript, Python, Next.js, Vue.js, PostgreSQL). Voice AI 85% (Deepgram, Cartesia TTS, Llama-3, Gemini, Claude). 3D Web 75% (Three.js, WebGL, GSAP).

KEY PROJECTS: Clarion Platform (multi-tenant contact center, FreeSWITCH/React/Node). Voice AI Eligibility Engine (sub-600ms latency, Deepgram/Llama-3). Controva Intelligence (B2B lead-gen AI, Python/Gemini). Siparch (3D enterprise portal, R3F/GSAP). Wholesale VoIP (5000+ concurrent calls).

CONTACT: uiwibi@gmail.com | wa.me/923166922090 | github.com/imaafaqakram`;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // API Route: /api/chat
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      let message;
      try { message = JSON.parse(body).message; } catch(e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      if (!message) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Message required' }));
      }

      if (!GEMINI_API_KEY) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ reply: "I am Wana, Waheeb's portfolio assistant! To enable dynamic live Gemini responses locally, set GEMINI_API_KEY in .env.local." }));
      }

      const payload = JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 100, thinkingConfig: { thinkingBudget: 0 } }
      });

      const apiReq = https.request({
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      }, apiRes => {
        let apiBody = '';
        apiRes.on('data', d => apiBody += d);
        apiRes.on('end', () => {
          if (apiRes.statusCode !== 200) {
            console.error('Gemini error:', apiBody);
            res.writeHead(500, {'Content-Type': 'application/json'});
            return res.end(JSON.stringify({ error: 'AI provider error' }));
          }
          try {
            const data = JSON.parse(apiBody);
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ reply: reply?.trim() || 'No response from AI.' }));
          } catch(err) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({ error: 'Parse error' }));
          }
        });
      });

      apiReq.on('error', e => {
        console.error('Gemini request error:', e.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: e.message }));
      });
      apiReq.write(payload);
      apiReq.end();
    });
    return;
  }

  // API Route: /api/tts
  if (req.url === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let text;
      try { text = JSON.parse(body).text; } catch(e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      if (!text) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Text required' }));
      }

      if (!CARTESIA_API_KEY) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({ error: 'Cartesia API key not configured' }));
      }

      const payload = JSON.stringify({
        model_id: 'sonic-3.5',
        transcript: text,
        voice: { mode: 'id', id: '30894953-bcce-41fe-892c-15ce19c843ff' },
        output_format: { container: 'mp3', encoding: 'mp3', sample_rate: 44100 }
      });

      const ttsReq = https.request({
        hostname: 'api.cartesia.ai',
        path: '/tts/bytes',
        method: 'POST',
        headers: {
          'Cartesia-Version': '2024-06-10',
          'X-API-Key': CARTESIA_API_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, ttsRes => {
        if (ttsRes.statusCode !== 200) {
          console.error('Cartesia error status:', ttsRes.statusCode);
          res.writeHead(500, {'Content-Type': 'application/json'});
          return res.end(JSON.stringify({ error: 'Cartesia API error' }));
        }
        res.writeHead(200, { 'Content-Type': 'audio/mpeg' });
        ttsRes.pipe(res);
      });

      ttsReq.on('error', e => {
        console.error('Cartesia request error:', e.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ error: e.message }));
      });
      ttsReq.write(payload);
      ttsReq.end();
    });
    return;
  }

  // Serve static files
  let cleanUrl = req.url.split('?')[0];
  let filePath = path.join(__dirname, cleanUrl === '/' ? 'index.html' : cleanUrl);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); return res.end();
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {'Content-Type': MIME[ext] || 'application/octet-stream'});
    res.end(data);
  });
});

const PORT = 3005;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
