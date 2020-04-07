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
    traces: async (
      _,
      { graphId, after, operationId, orderBy, to, from, traceFilters },
      { req }
    ) => {
      // TODO permissions
      //
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
        orderBy,
        cursor,
        processDates(from, to),
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
    trace: async (
      _,
      { traceId },
      { req }
    ) => {
      return Trace.findById(traceId)
    },
    operations: async (
      _,
      { graphId, orderBy, after, traceFilters, to, from },
      { req }
    ) => {
      // TODO permissions
      if (!orderBy) {
        orderBy = { field: 'count', asc: false }
      }

      if (!traceFilters) {
        traceFilters = []
      }

      const limit = 7
      const [cursor] = Cursor.decode(after)
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
          ? Cursor.encode(nodes.pop(), 'key', orderBy.asc)
          : '',
        nodes
      }
    },
    rpm: async (
      _,
      { graphId, operationId, to, from, traceFilters },
      { req }
    ) => {
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
      return `${graphId}:${Key.decrypt(secret)}`
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
