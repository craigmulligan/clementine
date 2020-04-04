import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: 'http://localhost:3000/api/graphql',
  credentials: 'include',
  name: 'webApp',
  version: '0.2.0'
})

export default client
