import React, { Fragment } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Login, CheckEmail } from './auth'
import { GraphShow, GraphSettings, GraphList, GraphHeader } from './graph'
import { OperationList, OperationHeader } from './operation'
import client from './client'
import {
  Route,
  Switch,
  BrowserRouter as Router,
  Redirect
} from 'react-router-dom'
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

                console.log({ isVisible })
                console.log(params.graphId)
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
              <Route exact path="/graph" component={GraphList} />
              <Route
                exact
                path="/graph/:graphId/settings"
                component={({ match: { params } }) => (
                  <Fragment>
                    <GraphHeader graphId={params.graphId} />
                    <GraphSettings graphId={params.graphId} />
                  </Fragment>
                )}
              />
              <Route
                exact
                path="/graph/:graphId/operation"
                component={({ match: { params } }) => (
                  <Fragment>
                    <GraphHeader graphId={params.graphId} />
                    <OperationList graphId={params.graphId} />
                  </Fragment>
                )}
              />
              <Route
                exact
                path="/graph/:graphId/rpm"
                component={({ match: { params } }) => (
                  <Fragment>
                    <GraphHeader graphId={params.graphId} />
                    <Rpm graphId={params.graphId} />
                  </Fragment>
                )}
              />
              <Route
                exact
                path="/graph/:graphId/ld"
                component={({ match: { params } }) => (
                  <Fragment>
                    <GraphHeader graphId={params.graphId} />
                    <LatencyDistribution graphId={params.graphId} />
                  </Fragment>
                )}
              />
              <Route
                exact
                path="/graph/:graphId/operation/:operationId/trace"
                component={({ match: { params } }) => (
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
                exact
                path="/graph/:graphId/operation/:operationId/rpm"
                component={({ match: { params } }) => (
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
                exact
                path="/graph/:graphId/operation/:operationId/ld"
                component={({ match: { params } }) => (
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
