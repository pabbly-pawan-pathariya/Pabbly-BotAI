import { Activity, CheckCircle, XCircle, Loader } from 'lucide-react'
import './StatusBar.css'

function StatusBar({ health, loading }) {
  const isConnected = health?.ollama?.connected

  return (
    <div className="status-bar">
      <div className="status-bar-content">
        <div className="status-item">
          <Activity size={14} />
          <span>System Status:</span>
          {loading ? (
            <span className="status-loading">
              <Loader size={14} className="spin" />
              Checking...
            </span>
          ) : health?.status === 'ok' ? (
            <span className="status-ok">
              <CheckCircle size={14} />
              Operational
            </span>
          ) : (
            <span className="status-error">
              <XCircle size={14} />
              Error
            </span>
          )}
        </div>
        
        <div className="status-item">
          <span>Ollama:</span>
          {loading ? (
            <span className="status-loading">
              <Loader size={14} className="spin" />
            </span>
          ) : isConnected ? (
            <span className="status-ok">
              <CheckCircle size={14} />
              Connected
            </span>
          ) : (
            <span className="status-error">
              <XCircle size={14} />
              Not Running
            </span>
          )}
        </div>

        {isConnected && health?.ollama?.models?.length > 0 && (
          <div className="status-item models">
            <span>Models:</span>
            <span className="model-tags">
              {health.ollama.models.slice(0, 3).map((model, i) => (
                <span key={i} className="model-tag">{model}</span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusBar
