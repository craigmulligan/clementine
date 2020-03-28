const { ApolloServer, gql } = require('apollo-server-express')

module.exports = gql`
  scalar JSON
  scalar DateTime

  type User {
    id: ID!
    email: String!
    graphs: [Graph]
  }

  type Graph {
    id: ID!
    name: String!
    user: User
    keys: [Key]!
  }

  type Key {
    id: ID!
    secret: String!
    graph: Graph!
  }

  type Trace {
    id: ID!
    duration: Float!
    startTime: DateTime!
    endTime: DateTime!
    execution: JSON!
    validation: JSON!
    parsing: JSON!
  }

  type Query {
    user: User
    graph(graph_id: ID!): Graph
    traces(graph_id: ID!): [Trace]
  }

  type Mutation {
    graphCreate(name: String!): Graph!
    keyCreate(graph_id: ID!): Key!
    userLogout: Boolean!
    userCreate(email: String, password: String): User!
    userLogin(email: String, password: String): User!
  }
`
