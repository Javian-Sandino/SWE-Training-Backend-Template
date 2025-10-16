import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Budgets from './components/Budgets'
import CreateBudget from './components/CreateBudget'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import './styles.css'

function Layout({ children }){
  return (
    <div className="app-root">
      <nav className="topnav">
        <h1>MoneyTracker</h1>
        <div className="navlinks">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/users">Users</Link>
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<>
            <CreateBudget />
            <hr />
            <Budgets />
          </>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
