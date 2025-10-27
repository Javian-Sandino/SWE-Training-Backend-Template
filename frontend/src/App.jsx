import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Auth from './components/Auth'
import BudgetDashboard from './components/BudgetDashboard'
import Transactions from './pages/Transactions'
import './styles.css'

function Layout({ children }){
  const { user, logout } = useAuth();

  return (
    <div className="app-root">
      <nav className="topnav">
        <h1>MoneyTracker</h1>
        <div className="navlinks">
          <Link to="/budgets">💰 Budgets</Link>
          <Link to="/transactions">💳 Transactions</Link>
        </div>
        <div className="user-info">
          {user && (
            <>
              <span>Welcome, {user.profile?.name || user.username}!</span>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  )
}

export default function App(){
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<BudgetDashboard />} />
          <Route path="/budgets" element={<BudgetDashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
