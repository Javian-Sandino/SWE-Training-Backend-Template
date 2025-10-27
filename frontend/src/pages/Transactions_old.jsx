import React, { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_TRANSACTIONS = gql`
  query GetTransactions($month:String,$category:String){
    transactions(month:$month,category:$category){
      id
      type
      amount
      date
      merchant
      category
      notes
    }
  }
`

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!){
    createTransaction(input:$input){
      id
      type
      amount
      date
      merchant
      category
      notes
    }
  }
`

export default function Transactions(){
  const { data, loading, error, refetch } = useQuery(GET_TRANSACTIONS)
  const [createTransaction] = useMutation(CREATE_TRANSACTION, {
    onCompleted(){ refetch() }
  })

  const [form, setForm] = useState({type:'EXPENSE',amount:0,date:new Date().toISOString().slice(0,10),merchant:'',category:'',notes:''})

  const submit = e =>{
    e.preventDefault()
    createTransaction({ variables: { input: { ...form, amount: Number(form.amount) } } })
  }

  return (
    <div>
      <h2>Transactions</h2>
      <form onSubmit={submit} style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:8,maxWidth:600}}>
        <label>Type</label>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
        <label>Amount</label>
        <input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} />
        <label>Date</label>
        <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        <label>Merchant</label>
        <input value={form.merchant} onChange={e=>setForm({...form,merchant:e.target.value})} />
        <label>Category</label>
        <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
        <label>Notes</label>
        <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        <div />
        <button type="submit">Add Transaction</button>
      </form>

      <hr />
      {loading && <p>Loading...</p>}
      {error && <p style={{color:'red'}}>Error: {error.message}</p>}
      <ul>
        {data?.transactions?.map(t=> (
          <li key={t.id}>{t.date} - {t.merchant || t.category} - ${t.amount} ({t.type})</li>
        ))}
      </ul>
    </div>
  )
}
