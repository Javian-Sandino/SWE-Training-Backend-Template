import React from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client'
import App from './App'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'

const client = new ApolloClient({
  link: new HttpLink({uri: GRAPHQL_URL}),
  cache: new InMemoryCache(),
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
)
