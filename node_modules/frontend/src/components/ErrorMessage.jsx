import React from 'react'

function ErrorMessage({ message, onRetry, retryLabel = 'Tentar novamente' }) {
  return (
    <div className="error-message">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{message}</span>
      </div>
      {onRetry && (
        <button className="retry-button" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
