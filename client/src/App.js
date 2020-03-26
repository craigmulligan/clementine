import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Signup, Login } from './auth'
import Dashboard from './dashboard'
import { GraphShow } from './graph'
import client from './client'
import { Route } from 'wouter'
import { UserProvider, UserRedirect } from './user'
import Menu from './menu'

function App() {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <main>
          <Menu />
          <div>
            <header>
              <h2>
                Clementine{' '}
                <span role="img" aria-label="emoji">
                  🍊
                </span>
              </h2>
            </header>
          </div>
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <UserRedirect>
            <Route path="/dash" component={Dashboard} />
            <Route
              path="/graph/:graphId"
              component={({ params }) => <GraphShow graphId={params.graphId} />}
            />
          </UserRedirect>
        </main>
      </UserProvider>
    </ApolloProvider>
  )
}

export default App
