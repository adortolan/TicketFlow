import React, { useState } from 'react'

function DeleteConfirmation({ user, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const handleConfirm = async () => {
    setDeleting(true)
    setDeleteError(null)

    try {
      await onConfirm()
      // Dialog will be closed by parent
    } catch (error) {
      setDeleteError(error.message || 'Erro ao excluir usuário')
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    if (!deleting) {
      onCancel()
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Confirmar Exclusão</h3>
        </div>
        
        <div className="modal-body">
          {deleteError && (
            <div className="error-message">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{deleteError}</span>
              </div>
            </div>
          )}
          
          <p>Tem certeza que deseja excluir o usuário abaixo?</p>
          
          <div className="user-details">
            <p><strong>Nome:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          
          <p className="warning-text">Esta ação não pode ser desfeita.</p>
        </div>
        
        <div className="modal-footer">
          <button
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={deleting}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmation
