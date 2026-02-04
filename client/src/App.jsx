import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'
import StatusBar from './components/StatusBar'
import { checkHealth } from './api/chat'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHealth = async () => {
      const status = await checkHealth()
      setHealth(status)
      setLoading(false)
    }
    
    fetchHealth()
    const interval = setInterval(fetchHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="app">
      <Header />
      <StatusBar health={health} loading={loading} />
      <main className="main-content">
        <ChatInterface />
      </main>
    </div>
  )
}

export default App
