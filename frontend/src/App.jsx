import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Auth from './components/Auth'
import Budgets from './components/Budgets'
import CreateBudget from './components/CreateBudget'
import Transactions from './pages/Transactions'
import Users from './pages/Users'
import './styles.css'

function Layout({ children }){
  const { user, logout } = useAuth();

  return (
    <div className="app-root">
      <nav className="topnav">
        <h1>MoneyTracker</h1>
        <div className="navlinks">
          <Link to="/">Dashboard</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/users">Users</Link>
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
          <Route path="/" element={<>
            <CreateBudget />
            <hr />
            <Budgets />
          </>} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
