exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { text } = JSON.parse(event.body);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: 'Reply ONLY with raw JSON, no markdown, no backticks, no code blocks. Format must be exactly: {"japanese":"...","english":"..."}. Task: 1. Lightly clean Japanese input. 2. Translate to natural English.',
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();
    if (data.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }

    const raw = data.content.map(b => b.text || '').join('').trim();
    const result = JSON.parse(raw);

    return { statusCode: 200, headers, body: JSON.stringify(result) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
