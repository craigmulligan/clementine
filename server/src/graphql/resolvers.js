const { ForbiddenError, GraphQLError } = require('apollo-server-express')
const bcrypt = require('bcrypt')
const User = require('../persistence/users')

module.exports = {
  Query: {
    user: (_, _args, { req }) => {
      return User.findById(req.session.userId)
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
        throw ForbiddenError('Invalid password or user')
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
    }
  }
}
