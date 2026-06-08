import React, { useState, useEffect } from 'react'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários')
      }
      const data = await response.json()
      setUsers(data)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="app">Carregando...</div>
  }

  if (error) {
    return <div className="app">Erro: {error}</div>
  }

  return (
    <div className="app">
      <h1>CRUD Frontend</h1>
      <h2>Lista de Usuários</h2>
      {users.length === 0 ? (
        <p>Nenhum usuário encontrado</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App
