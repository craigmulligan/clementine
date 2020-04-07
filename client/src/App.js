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
  OperationHeader
} from './operation'
import client from './client'
import { Route, Switch, Router } from 'wouter'
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
                <Route path="/graph/:graphId*" component={({ params }) => {
                  if (!params.graphId) {
                    return <div/>
                  }

                  return (<Filters graphId={params.graphId.split('/')[0]} />)
                }} />
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

                <Route
                  path="/graph/:graphId/operation/:operationId/trace/:traceId"
                  component={({ params }) => (
                    <TraceShow
                      traceId={params.traceId}
                    />
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
