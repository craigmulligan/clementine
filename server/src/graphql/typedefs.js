const { ApolloServer, gql } = require('apollo-server-express')

module.exports = gql`
  scalar JSON
  scalar DateTime

  enum OperationOrderFields {
    duration
    count
    errorCount
    errorPercent
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
    keyMetrics: KeyMetics
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
    keyMetrics: KeyMetics!
  }

  type OperationConnection {
    nodes: [Operation]!
    cursor: String
  }

  type TraceConnection {
    nodes: [Trace]!
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
      after: String
    ): TraceConnection
    operations(
      graphId: ID!
      orderBy: OperationOrderBy
      after: String
    ): OperationConnection
  }

  type Mutation {
    graphCreate(name: String!): Graph!
    keyCreate(graphId: ID!): Key!
    userLogout: Boolean!
    userCreate(email: String, password: String): User!
    userLogin(email: String, password: String): User!
  }
`
