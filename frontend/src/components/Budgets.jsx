import React from 'react'
import { useQuery, gql } from '@apollo/client'

const GET_BUDGETS = gql`
  query GetBudgets($month: String){
    budgets(month: $month){
      id
      month
      category
      limit
      notes
    }
  }
`

export default function Budgets(){
  const { data, loading, error, refetch } = useQuery(GET_BUDGETS, { variables: { month: null } })

  if(loading) return <p>Loading budgets...</p>
  if(error) return <p>Error loading budgets: {error.message}</p>

  return (
    <div>
      <h2>Budgets</h2>
      <button onClick={()=>refetch()}>Refresh</button>
      <ul>
        {data?.budgets?.map(b=> (
          <li key={b.id}>{b.month} - {b.category}: ${b.limit} {b.notes?`(${b.notes})`:''}</li>
        ))}
      </ul>
    </div>
  )
}
