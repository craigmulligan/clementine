import React from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Login, CheckEmail } from './auth'
import { GraphSettings, GraphList, GraphHeader } from './graph'
import { OperationList, OperationHeader } from './operation'
import client from './client'
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'
import { UserProvider, UserRedirect } from './user'
import Menu from './menu'
import { TraceList, FiltersProvider, Filters, TraceShow } from './trace'
import { Rpm, LatencyDistribution } from './timeline'

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <UserProvider>
          <FiltersProvider>
            <Route
              path="/graph/:graphId"
              component={({ match: { params }, location }) => {
                const isVisible = new URLSearchParams(location.search).get(
                  'filters'
                )

                return (
                  <Filters graphId={params.graphId} isVisible={!!isVisible} />
                )
              }}
            />
            <main>
              <Menu />
              <Route exact path="/magic" component={CheckEmail} />
              <Route exact path="/login" component={Login} />
            </main>
            <UserRedirect>
              <Switch>
                <Route
                  path="/graph/:graphId/operation/:operationId"
                  component={({ match: { params } }) => (
                    <OperationHeader
                      graphId={params.graphId}
                      operationId={params.operationId}
                    />
                  )}
                />
                <Route
                  path="/graph/:graphId"
                  component={({ match: { params }, location }) => {
                    return <GraphHeader graphId={params.graphId} />
                  }}
                />
              </Switch>
              <Route exact path="/graph" component={GraphList} />
              <Route
                exact
                path="/graph/:graphId/settings"
                component={({ match: { params } }) => (
                  <GraphSettings graphId={params.graphId} />
                )}
              />
              <Route
                exact
                path="/graph/:graphId/operation"
                component={({ match: { params } }) => (
                  <OperationList graphId={params.graphId} />
                )}
              />
              <Route
                exact
                path="/graph/:graphId/rpm"
                component={({ match: { params } }) => (
                  <Rpm graphId={params.graphId} />
                )}
              />
              <Route
                exact
                path="/graph/:graphId/ld"
                component={({ match: { params } }) => (
                  <LatencyDistribution graphId={params.graphId} />
                )}
              />

              <Route
                exact
                path="/graph/:graphId/operation/:operationId/trace"
                component={({ match: { params } }) => (
                  <TraceList
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
              <Route
                exact
                path="/graph/:graphId/operation/:operationId/rpm"
                component={({ match: { params } }) => (
                  <Rpm
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
              <Route
                exact
                path="/graph/:graphId/operation/:operationId/ld"
                component={({ match: { params } }) => (
                  <LatencyDistribution
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />

              <Route
                exact
                path="/graph/:graphId/operation/:operationId/trace/:traceId"
                component={({ match: { params } }) => (
                  <TraceShow traceId={params.traceId} />
                )}
              />
            </UserRedirect>
          </FiltersProvider>
        </UserProvider>
      </Router>
    </ApolloProvider>
  )
}

export default App
