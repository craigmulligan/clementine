const { ForbiddenError, GraphQLError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const User = require('../persistence/users')
const Graph = require('../persistence/graphs')
const Key = require('../persistence/keys')
const Trace = require('../persistence/traces')
const { DateTimeResolver, JSONResolver } = require('graphql-scalars')

module.exports = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,
  Query: {
    user: (_, _args, { req }) => {
      // TODO permissions
      return User.findById(req.session.user_id)
    },
    graph: (_, { graph_id }, { req }) => {
      // TODO permissions
      return Graph.findById(graph_id)
    },
    traces: (_, { graph_id }, { req }) => {
      // TODO permissions
      return Trace.findAll({ graph_id })
    }
  },
  Mutation: {
    userCreate: async (_, { email, password }, { req }) => {
      const user = await User.create(email, password)
      req.session.user_id = user.id
      return user
    },
    userLogin: async (_, { email, password }, { req }) => {
      const user = await User.find(email)
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ForbiddenError('Invalid password or user')
      }

      req.session.user_id = user.id

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
      const user_id = req.session.user_id
      return Graph.create(name, user_id)
    },
    keyCreate: (_, { graph_id }, { req }) => {
      // TODO permissions
      return Key.create(graph_id)
    }
  },
  Graph: {
    user: ({ user_id }) => {
      return User.findById(user_id)
    },
    keys: ({ id }) => {
      return Key.findAll({ graph_id: id })
    }
  },
  User: {
    graphs: ({ id }) => {
      return Graph.findAll({ user_id: id })
    }
  },
  Key: {
    secret: ({ graph_id, secret }) => {
      return `${graph_id}:${Key.decrypt(secret)}`
    },
    graph: ({ graph_id }) => {
      return Graph.findById(graph_id)
    }
  }
}
