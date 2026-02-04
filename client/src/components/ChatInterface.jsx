import { useState, useRef, useEffect } from 'react'
import { Send, Loader, User, Zap, Trash2 } from 'lucide-react'
import ResponseRenderer from './ResponseRenderer'
import { sendMessage } from '../api/chat'
import './ChatInterface.css'

function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage
    }])

    setLoading(true)

    try {
      const response = await sendMessage(userMessage)

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: response.data,
        raw: response
      }])
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'error',
        content: err.message
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  const exampleQueries = [
    "What is an automation?",
    "Create onboarding workflow",
    "Setup email campaign",
    "Build abandoned cart automation"
  ]

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-screen">
            <div className="welcome-icon">
              <Zap size={48} />
            </div>
            <h2>Welcome to <span className="highlight">Pabbly AI</span></h2>
            <p>Your intelligent automation assistant. I can help you create workflows, answer questions, and execute tasks.</p>

            <div className="example-queries">
              <span className="examples-label">Try asking:</span>
              <div className="examples-grid">
                {exampleQueries.map((query, i) => (
                  <button
                    key={i}
                    className="example-btn"
                    onClick={() => setInput(query)}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? (
                    <User size={18} />
                  ) : (
                    <Zap size={18} />
                  )}
                </div>
                <div className="message-content">
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : msg.role === 'error' ? (
                    <div className="error-message">
                      <p>{msg.content}</p>
                    </div>
                  ) : (
                    <ResponseRenderer response={msg.content} />
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <div className="message-avatar">
                  <Zap size={18} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-area">
        {messages.length > 0 && (
          <button className="clear-btn" onClick={clearChat} title="Clear chat">
            <Trash2 size={16} />
          </button>
        )}

        <form onSubmit={handleSubmit} className="chat-form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about automations..."
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="send-btn"
          >
            {loading ? <Loader size={20} className="spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
