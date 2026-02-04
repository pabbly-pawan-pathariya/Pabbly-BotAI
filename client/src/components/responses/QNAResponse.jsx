import { HelpCircle, Lightbulb, ArrowRight } from 'lucide-react'
import './QNAResponse.css'

function QNAResponse({ data }) {
  const { answer, related_features = [], follow_up_suggestions = [] } = data

  return (
    <div className="response-card qna-response">
      <div className="response-header">
        <span className="response-badge qna">QNA</span>
        <HelpCircle size={16} className="header-icon" />
        <span className="response-title">Answer</span>
      </div>
      
      <div className="response-body">
        <p className="qna-answer">{answer}</p>
        
        {related_features.length > 0 && (
          <div className="qna-section">
            <h4>
              <Lightbulb size={14} />
              Related Features
            </h4>
            <div className="feature-tags">
              {related_features.map((feature, i) => (
                <span key={i} className="feature-tag">{feature}</span>
              ))}
            </div>
          </div>
        )}
        
        {follow_up_suggestions.length > 0 && (
          <div className="qna-section">
            <h4>
              <ArrowRight size={14} />
              Follow-up Suggestions
            </h4>
            <ul className="suggestions-list">
              {follow_up_suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default QNAResponse
