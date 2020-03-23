const { ForbiddenError, GraphQLError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const User = require('../persistence/users')
const Session = require('../persistence/sessions')

module.exports = {
  Query: {
    user: async (_, _args, { req }) => {
      const u = await User.findById(req.userId)
      return u
    }
  },
  Mutation: {
    userCreate: (_, { email, password }) => {
      return User.create(email, password)
    },
    userLogin: async (_, { email, password }, { req }) => {
      const user = await User.find(email)
      if (!user || !(await bcrypt.compare(password, user.password))) {
        ForbiddenError('Invalid password or user')
      }

      const sessionId = await Session.create(user.id)
      req.session.id = sessionId
      return {
        id: sessionId
      }
    },
    userLogout: async (_, {}, { req }) => {
      try {
        if (req.session.id) {
          await Session.delete(req.session.id)
        }

        req.session.id = null
        return
      } catch (error) {
        throw GraphQLError(`DELETE session >> ${error.stack}`)
      }
    }
  }
}
