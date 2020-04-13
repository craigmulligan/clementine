const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const { typeDefs, resolvers } = require('./graphql')
const { ApolloServer } = require('apollo-server-express')
const { SESSION_SECRET } = require('./config')
const cors = require('cors')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const redis = require('redis').createClient({ host: 'redis' })
const logger = require('loglevel')
const emailjs = require('emailjs')
const magicLink = require('./magicLink')

const email = emailjs.server.connect({
  user: process.env.SMTP_EMAIL,
  password: process.env.SMTP_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: true
})

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
      '5ec2bf9c-a5c7-4845-8b96-2b1c3e6cb2f7:33931407-f48d-492b-9cfd-3774225dc0de',
    debugPrintReports: true,
    schemaTag: 'test',
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
      magicLink: magicLink({
        redis,
        email,
        host: 'http://localhost:5000'
      }),
      req,
      res
    }
  }
})

app.use(
  session({
    store: new RedisStore({ client: redis }),
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
