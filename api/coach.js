module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GROQ_API_KEY is not set on the server. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.'
    });
  }

  const { workouts = [], exercises = [], measurements = [], trackTimes = [] } = req.body || {};

  const prompt = `You are a track & field strength and conditioning coach reviewing a 17-year-old sprinter's training log. You are given raw JSON data below: workouts (training sessions with category and date), exercises (individual lifts with sets/reps/weight tied to a workout), measurements (bodyweight and body measurements over time), and trackTimes (100m/200m/400m times).

Respond ONLY with strict JSON, no markdown code fences, no preamble, in exactly this shape:
{"weekly_summary": "...", "training_trend": "...", "focus": "...", "patterns": "..."}

Each field should be 2-4 concise, specific sentences grounded in the actual numbers given. If there isn't enough data for a section, say so briefly rather than inventing detail.

workouts: ${JSON.stringify(workouts).slice(0, 4000)}
exercises: ${JSON.stringify(exercises).slice(0, 6000)}
measurements: ${JSON.stringify(measurements).slice(0, 3000)}
trackTimes: ${JSON.stringify(trackTimes).slice(0, 2000)}`;

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 700
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(500).json({ error: data.error?.message || 'Groq API error' });
    }

    const text = (data.choices?.[0]?.message?.content || '').trim();
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      parsed = { weekly_summary: clean, training_trend: '', focus: '', patterns: '' };
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
