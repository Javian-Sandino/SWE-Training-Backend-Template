import React from 'react'
import Budgets from './components/Budgets'
import CreateBudget from './components/CreateBudget'

export default function App(){
  return (
    <div style={{padding:20,fontFamily:'Arial'}}>
      <h1>MoneyTracker - Frontend</h1>
      <CreateBudget />
      <hr />
      <Budgets />
    </div>
  )
}
