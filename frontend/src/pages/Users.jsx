import React from 'react'
import { useQuery, gql } from '@apollo/client'

const GET_USERS = gql`
  query GetUsers{
    users{ id username email }
  }
`

export default function Users(){
  const { data, loading, error } = useQuery(GET_USERS)

  return (
    <div>
      <h2>Users</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error.message}</p>}
      <ul>
        {data?.users?.map(u=> <li key={u.id}>{u.username} ({u.email})</li>)}
      </ul>
    </div>
  )
}
