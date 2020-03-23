const express = require('express')

const morgan = require('morgan')
const clientSession = require('client-sessions')
const helmet = require('helmet')
const { typeDefs, resolvers } = require('./src/graphql')
const Session = require('./src/persistence/sessions')
const { ApolloServer } = require('apollo-server-express')
const { SESSION_SECRET } = require('./config')

const app = express()
const api = require('./src/api')
const gql = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, res }) => {
    if (req.session.id) {
      // inject userId
      const session = await Session.find(req.session.id)
      if (!session) {
        req.session.id = null
      }

      req.userId = session.userId
    }

    return {
      req,
      res
    }
  }
})

app.get('/', (req, res) => res.sendStatus(200))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(morgan('short'))
app.use(express.json())
app.use(
  clientSession({
    cookieName: 'session',
    secret: SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000
  })
)
app.use(helmet())
app.use(api)
gql.applyMiddleware({ app, path: '/api/graphql' })

let server
module.exports = {
  app,
  start(port) {
    server = app.listen(port, () => {
      console.log(`App started on port ${port}`)
    })
    return app
  },
  stop() {
    server.close()
  }
}
