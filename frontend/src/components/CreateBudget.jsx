import React, { useState } from 'react'
import { useMutation, gql } from '@apollo/client'

const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!){
    createBudget(input: $input){
      id
      month
      category
      limit
      notes
    }
  }
`

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

export default function CreateBudget(){
  const [month, setMonth] = useState('2025-10')
  const [category, setCategory] = useState('Groceries')
  const [limit, setLimit] = useState(500)
  const [notes, setNotes] = useState('')

  const [createBudget, { data, loading, error }] = useMutation(CREATE_BUDGET, {
    // update the Apollo cache so the Budgets list updates instantly
    update(cache, { data: { createBudget } }){
      try{
        const existing = cache.readQuery({ query: GET_BUDGETS, variables: { month: null } })
        if(existing?.budgets){
          cache.writeQuery({
            query: GET_BUDGETS,
            variables: { month: null },
            data: { budgets: [createBudget, ...existing.budgets] }
          })
        }
      }catch(err){
        // no-op: cache may be empty, write initial value
        cache.writeQuery({
          query: GET_BUDGETS,
          variables: { month: null },
          data: { budgets: [createBudget] }
        })
      }
    }
  })

  const submit = e =>{
    e.preventDefault()
    createBudget({ variables: { input: { month, category, limit: Number(limit), notes } } })
  }

  return (
    <div>
      <h2>Create Budget</h2>
      <form onSubmit={submit} style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8,maxWidth:400}}>
        <label>Month</label>
        <input value={month} onChange={e=>setMonth(e.target.value)} />
        <label>Category</label>
        <input value={category} onChange={e=>setCategory(e.target.value)} />
        <label>Limit</label>
        <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} />
        <label>Notes</label>
        <input value={notes} onChange={e=>setNotes(e.target.value)} />
        <div />
        <button type="submit" disabled={loading}>{loading? 'Creating...':'Create Budget'}</button>
      </form>
      {error && <p style={{color:'red'}}>Error: {error.message}</p>}
      {data && <p>Created: {data.createBudget.month} - {data.createBudget.category}</p>}
    </div>
  )
}
