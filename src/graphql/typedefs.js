const { ApolloServer, gql } = require('apollo-server-express')

module.exports = gql`
  type User {
    id: ID!
    email: String!
  }

  type Query {
    user: User
  }

  type SessionToken {
    id: ID!
  }

  type Mutation {
    userLogout: Boolean!
    userCreate(email: String, password: String): User!
    userLogin(email: String, password: String): SessionToken!
  }
`
