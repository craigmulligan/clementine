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
import {
  OperationShow,
  OperationList,
  OperationSource,
  OperationHeader
} from './operation'
import client from './client'
import { Route, Switch } from 'wouter'
import { UserProvider, UserRedirect } from './user'
import Menu from './menu'
import { TraceList, FiltersProvider } from './trace'
import { TimeLine, Rpm, LatencyDistribution } from './timeline'

function App() {
  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <main>
          <Menu />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
          <UserRedirect>
            <FiltersProvider>
              <Route path="/graph" component={GraphList} />
              <Switch>
                <Route
                  path="/graph/create"
                  component={({ params }) => <GraphCreate />}
                />
                <Route
                  path="/graph/:graphId"
                  component={({ params }) => (
                    <Fragment>
                      <GraphHeader graphId={params.graphId} />
                      <GraphShow graphId={params.graphId} />
                    </Fragment>
                  )}
                />
              </Switch>
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
                  <Fragment>
                    <OperationHeader
                      graphId={params.graphId}
                      operationId={params.operationId}
                    />
                    <OperationShow
                      graphId={params.graphId}
                      operationId={params.operationId}
                    />
                  </Fragment>
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
              <Route
                path="/graph/:graphId/operation/:operationId/rpm"
                component={({ params }) => (
                  <Rpm
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
              <Route
                path="/graph/:graphId/operation/:operationId/ld"
                component={({ params }) => (
                  <LatencyDistribution
                    graphId={params.graphId}
                    operationId={params.operationId}
                  />
                )}
              />
            </FiltersProvider>
          </UserRedirect>
        </main>
      </UserProvider>
    </ApolloProvider>
  )
}

export default App
