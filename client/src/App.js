import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Signup, Login } from './auth'
import { GraphShow, GraphSettings, GraphCreate, GraphList } from './graph'
import { OperationShow, OperationList, OperationSource } from './operation'
import client from './client'
import { Route, Switch } from 'wouter'
import { UserProvider, UserRedirect } from './user'
import Menu from './menu'
import { TraceList } from './trace'

function App() {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <body>
          <main>
            <Menu />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <UserRedirect>
              <Route path="/graph" component={GraphList} />
              <Switch>
                <Route
                  path="/graph/create"
                  component={({ params }) => <GraphCreate />}
                />
                <Route
                  path="/graph/:graphId"
                  component={({ params }) => (
                    <GraphShow graphId={params.graphId} />
                  )}
                />
              </Switch>
              <Route
                path="/graph/:graphId/settings"
                component={({ params }) => (
                  <GraphSettings graphId={params.graphId} />
                )}
              />
              <Route
                path="/graph/:graphId/operation"
                component={({ params }) => (
                  <OperationList
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
              <Route
                path="/graph/:graphId/operation/:operationId"
                component={({ params }) => (
                  <OperationShow
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
              <Route
                path="/graph/:graphId/operation/:operationId/source"
                component={({ params }) => (
                  <OperationSource>{atob(params.operationId)}</OperationSource>
                )}
              />
              <Route
                path="/graph/:graphId/operation/:operationId/trace"
                component={({ params }) => (
                  <TraceList
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
            </UserRedirect>
          </main>
        </body>
      </UserProvider>
    </ApolloProvider>
  )
}

export default App
