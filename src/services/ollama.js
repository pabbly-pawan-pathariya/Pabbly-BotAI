import { getSystemPrompt } from '../prompts/system-prompt.js';

export async function chat(userMessage) {
  const host = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
  const model = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT) || 60000; // 60 seconds default

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
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
        keep_alive: '10m', // Keep model in memory longer (faster subsequent requests)
        options: {
          temperature: 0.2, // Lower = faster, more deterministic decisions (reduced from 0.5)
          num_predict: 512, // Reduced from 1024 - shorter responses = faster generation (enough for JSON)
          top_k: 10, // Reduced from 20 - even fewer candidates = faster sampling
          top_p: 0.75, // Reduced from 0.85 - faster nucleus sampling
          tfs_z: 1.0, // Tail free sampling - helps speed up generation
          typical_p: 1.0, // Typical sampling - can speed up generation
          repeat_penalty: 1.05, // Slightly reduced - less computation
          num_ctx: 1024, // Reduced from 2048 - smaller context = faster processing
          num_thread: 6, // Increased threads for faster parallel processing (adjust if you have more cores)
          numa: false, // Disable NUMA for faster memory access
          use_mmap: true, // Use memory mapping for faster model loading
          use_mlock: false // Don't lock memory (faster, but may swap)
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Model "${model}" not found. Pull it with: ollama pull ${model}`);
      }
      const errText = await response.text();
      throw new Error(`Ollama error: ${response.status} ${response.statusText}${errText ? ` - ${errText}` : ''}`);
    }

    const data = await response.json();
    const content = data.message?.content;
    return typeof content === 'string' ? content : (content ? String(content) : '');
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms. The model may be processing a complex response. Try simplifying your query or using a faster model.`);
    }
    throw error;
  }
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
