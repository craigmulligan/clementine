const { ForbiddenError, GraphQLError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const { User, Graph, Key, Trace } = require('../persistence')
const { DateTimeResolver, JSONResolver } = require('graphql-scalars')

module.exports = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Query: {
    user: (_, _args, { req }) => {
      // TODO permissions
      return User.findById(req.session.userId)
    },
    graph: (_, { graphId }, { req }) => {
      // TODO permissions
      return Graph.findById(graphId)
    },
    traces: (_, { graphId }, { req }) => {
      // TODO permissions
      return Trace.findAll({ graphId })
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
        throw GraphQLError(`DELETE session >> ${error.stack}`)
      }
    },
    graphCreate: async (_, { name }, { req }) => {
      const userId = req.session.userId
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
    operations: ({ id }) => {
      return Trace.findAllSlowest({ graphId: id })
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
  }
}
