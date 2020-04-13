import React, { Fragment } from 'react'
import { ApolloProvider } from '@apollo/react-hooks'
import { Signup, Login, CheckEmail } from './auth'
import {
  GraphShow,
  GraphSettings,
  GraphCreate,
  GraphList,
  GraphHeader
} from './graph'
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
          <main>
            <FiltersProvider>
              <Menu />
              <Route path="/signup" component={Signup} />
              <Route path="/login" component={Login} />
              <Route path="/magic" component={CheckEmail} />
              <UserRedirect>
                <Route exact path="/graph" component={GraphList} />
                <Route
                  path="/graph/:graphId"
                  component={({ match: { params, ...props }, location }) => {
                    console.log(location.search)
                    return (
                      <Filters
                        graphId={params.graphId}
                        isVisible={
                          !!new URLSearchParams(location.search).get('filters')
                        }
                      />
                    )
                  }}
                />
                <Switch>
                  <Route
                    path="/graph/create"
                    component={({ match: { params } }) => <GraphCreate />}
                  />
                  <Route
                    path="/graph/:graphId"
                    component={({ params }) => (
                      <Redirect to={`/graph/${params.graphId}/operation`} />
                    )}
                  />
                </Switch>
                <Route
                  exact
                  path="/graph/:graphId"
                  component={({ match: { params } }) => (
                    <Redirect to={`/graph/${params.graphId}/operation`} />
                  )}
                />
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
                  path="/graph/:graphId/operation/:operationId"
                  component={({ match: { params } }) => (
                    <Redirect
                      to={`/graph/${params.graphId}/operation/${params.operationId}/trace`}
                    />
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
          </main>
        </UserProvider>
      </Router>
    </ApolloProvider>
  )
}

export default App
