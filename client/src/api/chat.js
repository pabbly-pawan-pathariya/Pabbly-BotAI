const API_BASE = '/api';

export async function sendMessage(message) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send message');
  }

  return data;
}

export async function checkHealth() {
  try {
    const response = await fetch('/health');
    const data = await response.json();
    return data;
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
