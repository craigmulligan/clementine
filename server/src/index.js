const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const { typeDefs, resolvers } = require('./graphql')
const { ApolloServer } = require('apollo-server-express')
const { SESSION_SECRET } = require('./config')
const cors = require('cors')
const redis = require('redis')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const logger = require('loglevel')

const app = express()
const api = require('./api')
app.use('/api', api)

const gql = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  engine: {
    endpointUrl: 'http://localhost:3000',
    apiKey:
      '16a0dbfd-8675-4439-8be5-1100c374acb8:7f921ca7-3d35-40f8-ba29-4a08cb0a650e',
    debugPrintReports: true,
    schemaTag: 'development',
    reportErrorFunction: err => {
      logger.error(err)
      return err
    }
  },
  formatError: err => {
    logger.error(err)
    logger.error(err.extensions.exception)
    return err
  },
  context: async ({ req, res }) => {
    return {
      req,
      res
    }
  }
})

const redisClient = redis.createClient({ host: 'redis' })

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    saveUninitialized: false,
    rolling: true,
    resave: false
  })
)
app.get('/', (req, res) => res.sendStatus(200))
app.get('/health', (req, res) => res.sendStatus(200))

app.use(morgan('short'))
app.use(helmet())
gql.applyMiddleware({
  app,
  path: '/api/graphql',
  cors: {
    origin: 'http://localhost:5000',
    credentials: true
  }
})

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
