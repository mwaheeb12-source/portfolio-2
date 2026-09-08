export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  const apiKey = process.env.CARTESIA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Cartesia API key not configured' });
  }

  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  try {
    const payload = JSON.stringify({
      model_id: 'sonic-3.5',
      transcript: text,
      voice: { mode: 'id', id: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc' },
      output_format: { container: 'mp3', encoding: 'mp3', sample_rate: 44100 }
    });

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2024-06-10',
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cartesia API error:", response.status, errorText);
      return res.status(response.status).json({ error: 'TTS provider error', details: errorText });
    }

    // Stream the audio blob back to the client
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);

  } catch (error) {
    console.error("TTS Server Error:", error);
    res.status(500).json({ error: 'Internal server error while generating audio' });
  }
}
