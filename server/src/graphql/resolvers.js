const {
  UserInputError,
  ForbiddenError,
  GraphQLError
} = require('apollo-server-express')
const { User, Graph, Key, Trace } = require('../persistence')
const { DateTimeResolver, JSONResolver } = require('graphql-scalars')
const { Cursor } = require('./utils')

// todo this should be injected for testing.
function processDates(from, to) {
  if (!to) {
    to = new Date()
  }
  if (!from) {
    from = new Date(0)
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
    traceFilterOptions: async (_, { graphId }, { req }) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      const options = await Trace.findFilterOptions({ graphId })

      return {
        ...options,
        hasErrors: ['true', 'false']
      }
    },
    user: async (_, _args, { req }) => {
      const user = await User.findById(req.session.userId)

      return user
    },
    graph: async (_, { graphId, ...rest }, { req }) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      return graph
    },
    traces: async (
      _,
      { graphId, after, operationId, orderBy, to, from, traceFilters },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!traceFilters) {
        traceFilters = []
      }
      if (!orderBy) {
        orderBy = { field: 'duration', asc: false }
      }

      const limit = 10
      const [cursor] = Cursor.decode(after)
      const nodes = await Trace.findAll(
        [
          ...traceFilters,
          { field: 'graphId', operator: 'eq', value: graphId },
          operationId && {
            field: 'operationId',
            operator: 'eq',
            value: operationId
          }
        ],
        processDates(from, to),
        orderBy,
        cursor,
        limit
      )

      // we always fetch one more than we need to calculate hasNextPage
      const hasNextPage = nodes.length >= limit

      return {
        cursor: hasNextPage
          ? Cursor.encode(nodes.pop(), 'id', orderBy.asc)
          : '',
        nodes
      }
    },
    trace: async (_, { graphId, traceId }, { req }) => {
      // TODO PERMISSIONS
      const trace = await Trace.findById(traceId)
      return trace
    },
    operations: async (
      _,
      { graphId, orderBy, after, traceFilters, to, from },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)

      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!orderBy) {
        orderBy = { field: 'count', asc: false }
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const limit = 11
      const cursor = Cursor.decode(after)
      const nodes = await Trace.findAllOperations(
        [...traceFilters, { field: 'graphId', operator: 'eq', value: graphId }],
        processDates(from, to),
        orderBy,
        cursor,
        limit
      )

      // we always fetch one more than we need to calculate hasNextPage
      const hasNextPage = nodes.length >= limit

      return {
        cursor: hasNextPage
          ? Cursor.encode(nodes.pop(), 'rowNumber', orderBy.asc)
          : '',
        nodes
      }
    },
    rpm: async (
      _,
      { graphId, operationId, to, from, traceFilters },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const nodes = await Trace.findRPM(
        [
          ...traceFilters,
          { field: 'graphId', operator: 'eq', value: graphId },
          operationId && {
            field: 'operationId',
            operator: 'eq',
            value: operationId
          }
        ],
        processDates(from, to)
      )

      return {
        nodes,
        cursor: ''
      }
    },
    latencyDistribution: async (
      _,
      { graphId, operationId, traceFilters, to, from },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const nodes = await Trace.latencyDistribution(
        [
          ...traceFilters,
          { field: 'graphId', operator: 'eq', value: graphId },
          operationId && {
            field: 'operationId',
            operator: 'eq',
            value: operationId
          }
        ],
        processDates(from, to)
      )

      return {
        nodes,
        cursor: ''
      }
    },
    stats: async (
      _,
      { graphId, operationId, traceFilters, to, from },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!traceFilters) {
        traceFilters = []
      }

      return Trace.findStats(
        [
          ...traceFilters,
          { field: 'graphId', operator: 'eq', value: graphId },
          operationId && {
            field: 'operationId',
            operator: 'eq',
            value: operationId
          }
        ],
        processDates(from, to)
      )
    },
    operation: async (
      _,
      { graphId, operationId, traceFilters, to, from },
      { req }
    ) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const rows = await Trace.findAllOperations(
        [
          ...traceFilters,
          { field: 'graphId', operator: 'eq', value: graphId },
          operationId && {
            field: 'operationId',
            operator: 'eq',
            value: operationId
          }
        ],
        processDates(from, to)
      )

      return rows[0]
    }
  },
  Mutation: {
    userLogin: async (_, { email }, { req, magicLink }) => {
      let user = await User.find(email)

      if (!user) {
        try {
          user = await User.create(email)
        } catch (e) {
          throw new ForbiddenError()
        }
      }

      // fire and forget
      magicLink.send(user)
      return true
    },
    tokenVerify: async (_, { token }, { req, magicLink }) => {
      const user = await magicLink.verify(token)

      if (!user) {
        throw new ForbiddenError()
      }

      req.session.userId = user.id
      req.session.userEmail = user.email

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
    keyCreate: async (_, { graphId }, { req }) => {
      const graph = await Graph.findById(graphId)
      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }
      return Key.create(graphId)
    },
    keyRevoke: async (_, { keyId }, { req }) => {
      const key = await Key.findById(keyId)
      const graph = await Graph.findById(key.graphId)

      if (graph.userId !== req.session.userId) {
        throw new ForbiddenError()
      }
      await Key.revoke(keyId)
      return true
    }
  },
  Graph: {
    user: ({ userId }) => {
      return User.findById(userId)
    },
    keys: ({ id }) => {
      return Key.findAll({ graphId: id })
    },
    stats: ({ id }, { traceFilters, from, to }) => {
      if (!traceFilters) {
        traceFilters = []
      }
      return Trace.findStats(
        [...traceFilters, { field: 'graphId', operator: 'eq', value: id }],
        processDates(from, to)
      )
    }
  },
  User: {
    graphs: ({ id }) => {
      return Graph.findAll({ userId: id })
    }
  },
  Key: {
    secret: ({ graphId, secret }) => {
      if (secret) {
        return `${graphId}:${secret}`
      }
      return null
    },
    graph: ({ graphId }) => {
      return Graph.findById(graphId)
    }
  },
  Operation: {
    stats: ({ duration, count, errorCount, errorPercent }) => {
      return { duration, count, errorCount, errorPercent }
    }
  }
}
