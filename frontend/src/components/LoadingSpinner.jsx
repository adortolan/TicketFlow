import React from 'react'

function LoadingSpinner({ size = 'medium' }) {
  const sizeStyles = {
    small: { width: '16px', height: '16px' },
    medium: { width: '32px', height: '32px' },
    large: { width: '48px', height: '48px' }
  }

  return (
    <div 
      className="spinner"
      style={sizeStyles[size]}
    />
  )
}

export default LoadingSpinner
