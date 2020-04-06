const { ApolloServer, gql } = require('apollo-server-express')

module.exports = gql`
  scalar JSON
  scalar DateTime

  enum FilterOperator {
    eq
    ne
  }

  enum TraceFilterField {
    schemaTag
    clientName
    clientVersion
  }

  input TraceFilter {
    operator: FilterOperator
    field: TraceFilterField
    value: String
  }

  enum OperationOrderFields {
    duration
    count
    errorCount
    errorPercent
  }

  type TraceFilterOptions {
    schemaTag: [String]
    clientName: [String]
    clientVersion: [String]
  }

  input OperationOrderBy {
    asc: Boolean!
    field: OperationOrderFields!
  }

  enum TraceOrderFields {
    duration
    startTime
  }

  input TraceOrderBy {
    asc: Boolean!
    field: TraceOrderFields!
  }

  type User {
    id: ID!
    email: String!
    createdAt: DateTime!
    graphs: [Graph]
  }

  type Graph {
    id: ID!
    name: String!
    createdAt: DateTime!
    user: User
    keys: [Key]!
    keyMetrics(traceFilters: [TraceFilter], from: DateTime, to: DateTime): KeyMetics
  }

  type KeyMetics {
    count: Int!
    errorCount: Int!
    errorPercent: Int!
    duration: Float!
  }

  type Key {
    id: ID!
    secret: String!
    createdAt: DateTime!
    graph: Graph!
  }

  type Operation {
    id: String!
    key: String!
    keyMetrics(traceFilters: [TraceFilter], from: DateTime, to: DateTime): KeyMetics
  }

  type OperationConnection {
    nodes: [Operation]!
    cursor: String
  }

  type TraceConnection {
    nodes: [Trace]!
    cursor: String
  }

  type LatencyDistribution {
    duration: Float!
    count: Int!
  }

  type LatencyDistributionConnection {
    nodes: [LatencyDistribution]!
    cursor: String
  }

  type RPM {
    startTime: DateTime!
    count: Int!
    errorCount: Int!
  }

  type RPMConnection {
    nodes: [RPM]!
    cursor: String
  }

  type Trace {
    id: ID!
    "Operation Key"
    key: String!
    duration: Float!
    startTime: DateTime!
    endTime: DateTime!
    createdAt: DateTime!
    root: JSON!
  }

  type Query {
    user: User
    graph(graphId: ID!): Graph
    traces(
      graphId: ID!
      operationId: ID
      orderBy: TraceOrderBy
      from: DateTime
      to: DateTime
      after: String
      traceFilters: [TraceFilter]
    ): TraceConnection
    operations(
      graphId: ID!
      orderBy: OperationOrderBy
      after: String
      from: DateTime
      to: DateTime
      traceFilters: [TraceFilter]
    ): OperationConnection
    latencyDistribution(
      graphId: ID!
      operationId: ID
      from: DateTime
      to: DateTime
      traceFilters: [TraceFilter]
    ): LatencyDistributionConnection!
    rpm(
      graphId: ID!
      operationId: ID
      from: DateTime
      to: DateTime
      traceFilters: [TraceFilter]
    ): RPMConnection!
    traceFilterOptions(graphId: ID!): TraceFilterOptions
  }

  type Mutation {
    graphCreate(name: String!): Graph!
    keyCreate(graphId: ID!): Key!
    userLogout: Boolean!
    userCreate(email: String, password: String): User!
    userLogin(email: String, password: String): User!
  }
`
