import React, { useState, useEffect } from 'react'
import UserList from './components/UserList'
import UserForm from './components/UserForm'
import DeleteConfirmation from './components/DeleteConfirmation'
import ErrorMessage from './components/ErrorMessage'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  
  // Form state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('create')
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ao buscar usuários (HTTP ${response.status})`)
      }
      const data = await response.json()
      setUsers(data)
      setLoading(false)
      setError(null)
    } catch (err) {
      setError(err.message || 'Erro de conexão ao buscar usuários')
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setFormMode('create')
    setSelectedUser(null)
    setFormOpen(true)
  }

  const handleEditUser = (user) => {
    setFormMode('edit')
    setSelectedUser(user)
    setFormOpen(true)
  }

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'create') {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Erro ao criar usuário (HTTP ${response.status})`)
        }
        
        showSuccessMessage('Usuário criado com sucesso!')
      } else {
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Erro ao atualizar usuário (HTTP ${response.status})`)
        }
        
        showSuccessMessage('Usuário atualizado com sucesso!')
      }
      
      // Success: close form and refresh list
      setFormOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (error) {
      throw error
    }
  }

  const handleFormCancel = () => {
    setFormOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ao excluir usuário (HTTP ${response.status})`)
      }
      
      showSuccessMessage('Usuário excluído com sucesso!')
      
      // Success: close dialog and refresh list
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      await fetchUsers()
    } catch (error) {
      throw error
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  if (loading) {
    return (
      <div className="app">
        <LoadingSpinner size="large" />
        <p>Carregando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <ErrorMessage 
          message={error} 
          onRetry={fetchUsers}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <h1>CRUD Frontend</h1>
      <h2>Lista de Usuários</h2>
      
      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <span>{successMessage}</span>
        </div>
      )}
      
      <button 
        className="btn btn-primary" 
        onClick={handleAddUser}
        style={{ marginBottom: '1rem' }}
      >
        Adicionar Usuário
      </button>
      
      <UserList 
        users={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      
      {formOpen && (
        <UserForm
          mode={formMode}
          initialData={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
      
      {deleteDialogOpen && (
        <DeleteConfirmation
          user={userToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  )
}

export default App
