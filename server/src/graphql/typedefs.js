const { ApolloServer, gql } = require('apollo-server-express')

module.exports = gql`
  type User {
    id: ID!
    email: String!
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

  type Query {
    user: User
  }

  type Mutation {
    graphCreate(name: String!): Graph!
    userLogout: Boolean!
    userCreate(email: String, password: String): User!
    userLogin(email: String, password: String): User!
  }
`
