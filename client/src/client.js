import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: 'http://localhost:3000/api/graphql',
  credentials: 'include'
})

export default client
