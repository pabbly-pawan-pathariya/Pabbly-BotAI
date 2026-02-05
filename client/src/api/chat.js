const API_BASE = '/api';

export async function sendMessage(message) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      response.ok
        ? 'Invalid response from server. Please try again.'
        : `Request failed: ${response.status} ${response.statusText}`
    );
  }

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send message');
  }

  return data;
}

export async function checkHealth() {
  try {
    const response = await fetch('/health');
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      return { status: 'error', error: 'Invalid health response' };
    }
    return data;
  } catch (error) {
    return { status: 'error', error: error.message };
  }
}
