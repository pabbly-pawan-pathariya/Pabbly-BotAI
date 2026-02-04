import { getSystemPrompt } from '../prompts/system-prompt.js';

export async function chat(userMessage) {
  const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'gemma3:4b';

  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: getSystemPrompt()
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      format: 'json',
      stream: false,
      options: {
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.message.content;
}

export async function checkConnection() {
  try {
    const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const response = await fetch(`${host}/api/tags`);
    if (!response.ok) {
      throw new Error('Failed to connect');
    }
    const data = await response.json();
    return {
      connected: true,
      models: data.models.map(m => m.name)
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}
