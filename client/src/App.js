import React, { Fragment } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Signup, Login } from './auth'
import {
  GraphShow,
  GraphSettings,
  GraphCreate,
  GraphList,
  GraphHeader
} from './graph'
import { OperationList, OperationHeader } from './operation'
import client from './client'
import { Route, Switch, Router, Redirect } from 'wouter'
import { UserProvider, UserRedirect } from './user'
import Menu from './menu'
import { TraceList, FiltersProvider, Filters, TraceShow } from './trace'
import { Rpm, LatencyDistribution } from './timeline'

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <UserProvider>
          <main>
            <FiltersProvider>
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
                </Switch>
                <Route
                  path="/graph/:graphId"
                  component={({ params }) => (
                    <Redirect to={`/graph/${params.graphId}/operation`} />
                  )}
                />
                <Route
                  path="/graph/:graphId/settings"
                  component={({ params }) => (
                    <Fragment>
                      <GraphHeader graphId={params.graphId} />
                      <GraphSettings graphId={params.graphId} />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/operation"
                  component={({ params }) => (
                    <Fragment>
                      <GraphHeader graphId={params.graphId} />
                      <OperationList graphId={params.graphId} />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/rpm"
                  component={({ params }) => (
                    <Fragment>
                      <GraphHeader graphId={params.graphId} />
                      <Rpm graphId={params.graphId} />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/ld"
                  component={({ params }) => (
                    <Fragment>
                      <GraphHeader graphId={params.graphId} />
                      <LatencyDistribution graphId={params.graphId} />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/operation/:operationId"
                  component={({ params }) => (
                    <Redirect
                      to={`/graph/${params.graphId}/operation/${params.operationId}/trace`}
                    />
                  )}
                />
                <Route
                  path="/graph/:graphId/operation/:operationId/trace"
                  component={({ params }) => (
                    <Fragment>
                      <OperationHeader
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                      <TraceList
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/operation/:operationId/rpm"
                  component={({ params }) => (
                    <Fragment>
                      <OperationHeader
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                      <Rpm
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                    </Fragment>
                  )}
                />
                <Route
                  path="/graph/:graphId/operation/:operationId/ld"
                  component={({ params }) => (
                    <Fragment>
                      <OperationHeader
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                      <LatencyDistribution
                        graphId={params.graphId}
                        operationId={params.operationId}
                      />
                    </Fragment>
                  )}
                />

                <Route
                  path="/graph/:graphId/operation/:operationId/trace/:traceId"
                  component={({ params }) => (
                    <TraceShow traceId={params.traceId} />
                  )}
                />
              </UserRedirect>
            </FiltersProvider>
          </main>
        </UserProvider>
      </Router>
    </ApolloProvider>
  )
}

export default App
