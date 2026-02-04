import { Zap, Sparkles } from 'lucide-react'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={24} />
          </div>
          <div className="logo-text">
            <h1>Pabbly <span className="highlight">AI</span></h1>
            <span className="tagline">
              <Sparkles size={12} />
              Intelligent Automation Assistant
            </span>
          </div>
        </div>
        <nav className="nav">
          <span className="nav-badge">
            <span className="badge-dot"></span>
            Powered by LLaMA 3
          </span>
        </nav>
      </div>
    </header>
  )
}

export default Header
