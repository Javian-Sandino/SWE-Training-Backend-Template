import React from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { AuthProvider } from './context/AuthContext'
import App from './App'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'

const httpLink = new HttpLink({
  uri: GRAPHQL_URL
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)
