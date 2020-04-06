const {
  UserInputError,
  ForbiddenError,
  GraphQLError
} = require('apollo-server-express')
const bcrypt = require('bcrypt')
const { User, Graph, Key, Trace } = require('../persistence')
const { DateTimeResolver, JSONResolver } = require('graphql-scalars')
const { Cursor } = require('./utils')


function processDates(from, to) {
  const dayMs = 86400000
  if (!to) {
    to = new Date()
  }
  if (!from) {
    from = new Date(to - dayMs)
  }

  return {
    from,
    to
  }
}

module.exports = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Query: {
    traceFilterOptions: (_, { graphId }, { req }) => {
      // TODO permissions
      return Trace.findFilterOptions({ graphId })
    },
    user: (_, _args, { req }) => {
      // TODO permissions
      return User.findById(req.session.userId)
    },
    graph: (_, { graphId, ...rest }, { req }) => {
      // TODO permissions
      return Graph.findById(graphId)
    },
    traces: async (_, { graphId, after, operationId, orderBy }, { req }) => {
      // TODO permissions
      let operationKey
      if (!orderBy) {
        orderBy = { field: 'duration', asc: false }
      }

      if (operationId) {
        operationKey = Buffer.from(operationId, 'base64').toString('utf-8')
      }
      const limit = 10
      const [cursor] = Cursor.decode(after)

      const nodes = await Trace.findAll(
        { graphId, operationKey },
        orderBy,
        cursor,
        limit
      )

      // we always fetch one more than we need to calculate hasNextPage
      const hasNextPage = nodes.length >= limit

      return {
        cursor: hasNextPage
          ? Cursor.encode(nodes.pop(), 'key', orderBy.asc)
          : '',
        nodes
      }
    },
    operations: async (
      _,
      { graphId, orderBy, after, traceFilters },
      { req }
    ) => {
      // TODO permissions
      if (!orderBy) {
        orderBy = { field: 'count', asc: false }
      }

      const limit = 7
      const [cursor] = Cursor.decode(after)
      const nodes = await Trace.findAllOperations(
        { graphId },
        orderBy,
        cursor,
        limit,
        traceFilters
      )

      // we always fetch one more than we need to calculate hasNextPage
      const hasNextPage = nodes.length >= limit

      return {
        cursor: hasNextPage
          ? Cursor.encode(nodes.pop(), 'key', orderBy.asc)
          : '',
        nodes
      }
    },
    rpm: async (_, { graphId, operationId, to, from, traceFilters }, { req }) => {
      let operationKey
      if (operationId) {
        operationKey = Buffer.from(operationId, 'base64').toString('utf-8')
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const nodes = await Trace.findRPM([
        ...traceFilters,
        { field: 'graphId', operator: 'eq', value: graphId },
        operationId && { field: 'operationKey', operator: 'eq', value: operationKey }
      ], processDates(from, to))

      return {
        nodes,
        cursor: ''
      }
    },
    latencyDistribution: async (_, { graphId, operationId, traceFilters, to, from }, { req }) => {
      let operationKey
      if (operationId) {
        operationKey = Buffer.from(operationId, 'base64').toString('utf-8')
      }

      if (!traceFilters) {
        traceFilters = []
      }


      const nodes = await Trace.latencyDistribution([
        ...traceFilters,
        { field: 'graphId', operator: 'eq', value: graphId },
        operationId && { field: 'operationKey', operator: 'eq', value: operationKey }
      ], processDates(from, to))

      return {
        nodes,
        cursor: ''
      }
    }
  },
  Mutation: {
    userCreate: async (_, { email, password }, { req }) => {
      const user = await User.create(email, password)
      req.session.userId = user.id
      return user
    },
    userLogin: async (_, { email, password }, { req }) => {
      const user = await User.find(email)
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ForbiddenError('Invalid password or user')
      }

      req.session.userId = user.id

      return user
    },
    userLogout: async (_, {}, { req }) => {
      try {
        req.session.destroy()

        return true
      } catch (error) {
        throw new GraphQLError(`DELETE session >> ${error.stack}`)
      }
    },
    graphCreate: async (_, { name }, { req }) => {
      const userId = req.session.userId

      if (name.length === 0) {
        throw new UserInputError('name cannot be empty')
      }

      return Graph.create(name, userId)
    },
    keyCreate: (_, { graphId }, { req }) => {
      // TODO permissions
      return Key.create(graphId)
    }
  },
  Graph: {
    user: ({ userId }) => {
      return User.findById(userId)
    },
    keys: ({ id }) => {
      return Key.findAll({ graphId: id })
    },
    keyMetrics: ({ id }, { traceFilters }) => {
      if (!traceFilters) {
        traceFilters = []
      }

      return Trace.findKeyMetrics([
        ...traceFilters,
        { field: 'graphId', operator: 'eq', value: id }
      ])
    }
  },
  User: {
    graphs: ({ id }) => {
      return Graph.findAll({ userId: id })
    }
  },
  Key: {
    secret: ({ graphId, secret }) => {
      return `${graphId}:${Key.decrypt(secret)}`
    },
    graph: ({ graphId }) => {
      return Graph.findById(graphId)
    }
  },
  Operation: {
    id: ({ key }) => {
      return Buffer.from(key).toString('base64')
    },
    keyMetrics: ({ duration, count, errorCount, errorPercent }) => {
      return { duration, count, errorCount, errorPercent }
    }
  }
}
