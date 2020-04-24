import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: '/api/graphql',
  name: 'webApp',
  version: '0.0.2'
})

export default client
