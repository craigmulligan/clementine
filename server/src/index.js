const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const { typeDefs, resolvers } = require('./graphql')
const { ApolloServer } = require('apollo-server-express')
const { SESSION_SECRET, CLIENT_URL } = require('./config')
const cors = require('cors')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const {
  redis: { client }
} = require('./persistence')
const logger = require('loglevel')
const magicLink = require('./magicLink')
const { User } = require('./persistence')

const app = express()
const api = require('./api')
app.use('/api', api)

const gql = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  engine: {
    logger,
    endpointUrl: 'http://localhost:3000',
    apiKey: process.env.ENGINE_API_KEY,
    debugPrintReports: true,
    schemaTag: 'test',
    sendHeaders: { all: true },
    sendVariableValues: { all: true },
    reportErrorFunction: err => {
      logger.error(err)
      return err
    }
  },
  formatError: err => {
    logger.error(err)
    if (err.extensions.exception) {
      logger.error(err.extensions.exception)
    }
    return err
  },
  context: async ({ req, res }) => {
    return {
      magicLink,
      req,
      res
    }
  }
})

app.use(
  session({
    store: new RedisStore({ client }),
    secret: SESSION_SECRET,
    saveUninitialized: false,
    rolling: true,
    resave: false
  })
)
app.get('/api', (req, res) => res.sendStatus(200))
app.get('/api/health', (req, res) => res.sendStatus(200))
app.get('/api/verify', async (req, res) => {
  console.log('YASSS')
  const token = req.query.token
  if (!token) {
    res.redirect(302, '/login')
  }

  const data = await magicLink.verify(token)

  if (data) {
    req.session.userId = data.id
    req.session.userEmail = data.email
  }

  User.markVerified(data.id)
  res.redirect(302, '/graph')
})

app.use(morgan('short'))
app.use(helmet())
gql.applyMiddleware({
  app,
  path: '/api/graphql',
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
})

module.exports = {
  app,
  magicLink
}
