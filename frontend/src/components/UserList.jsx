import React from 'react'

function UserList({ users, onEdit, onDelete }) {
  if (users.length === 0) {
    return <p>Nenhum usuário encontrado</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <button 
                className="btn btn-secondary" 
                onClick={() => onEdit(user)}
              >
                Editar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => onDelete(user)}
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default UserList
