# PlatformAI

An intelligent SaaS assistant powered by Ollama and LLaMA 3. PlatformAI can answer questions, design workflows, and generate structured tasks for your platform.

## Architecture

```
Frontend (React + Vite)
   ↓
Backend (Node.js + Express)
   ↓
LLM Runtime (Ollama)
   ↓
Open-source Model (LLaMA 3 8B)
```

## Features

- **QNA Mode**: Answer questions about the platform, features, and concepts
- **WORKFLOW Mode**: Design automation workflows with triggers, conditions, and actions
- **TASK Mode**: Generate structured tasks with execution steps

## Prerequisites

- Node.js 18+
- [Ollama](https://ollama.ai/) installed and running
- LLaMA 3 model pulled (`ollama pull llama3`)

## Quick Start

### 1. Install Ollama

Download and install from [ollama.ai](https://ollama.ai/)

### 2. Pull the LLaMA 3 Model

```bash
ollama pull llama3
```

### 3. Start Ollama

```bash
ollama serve
```

### 4. Install Dependencies

```bash
# Install all dependencies (backend + frontend)
npm run setup
```

### 5. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
```

### 6. Run the Application

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### POST /api/chat

Send a message to the AI assistant.

**Request:**
```json
{
  "message": "What is an automation?"
}
```

**Response (QNA):**
```json
{
  "success": true,
  "data": {
    "mode": "QNA",
    "data": {
      "answer": "An automation is...",
      "related_features": ["workflows", "triggers"],
      "follow_up_suggestions": ["How to create an automation?"]
    }
  }
}
```

### GET /health

Check system health and Ollama connection status.

## Response Modes

### QNA Mode
Used when the user asks questions or needs explanations.

### WORKFLOW Mode
Used when the user wants to create or design automations.

```json
{
  "mode": "WORKFLOW",
  "data": {
    "workflow_name": "Onboarding Automation",
    "description": "Welcome new users",
    "nodes": [...],
    "edges": [...]
  }
}
```

### TASK Mode
Used when the user wants to perform platform actions.

```json
{
  "mode": "TASK",
  "data": {
    "task_type": "email_campaign",
    "task_name": "Welcome Email",
    "description": "Send welcome email to new users",
    "inputs": {...},
    "steps": [...]
  }
}
```

## Project Structure

```
platform-ai/
├── src/
│   ├── index.js           # Express server entry
│   ├── routes/
│   │   └── chat.js        # Chat API endpoint
│   ├── services/
│   │   └── ollama.js      # Ollama integration
│   ├── prompts/
│   │   └── system-prompt.js
│   └── utils/
│       └── validator.js   # Response validation
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/
│   │   │   └── chat.js
│   │   └── components/
│   │       ├── ChatInterface.jsx
│   │       ├── Header.jsx
│   │       ├── StatusBar.jsx
│   │       ├── ResponseRenderer.jsx
│   │       └── responses/
│   │           ├── QNAResponse.jsx
│   │           ├── WorkflowResponse.jsx
│   │           └── TaskResponse.jsx
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## License

MIT
