const { app } = require('../../index')
const { User, Graph, Trace } = require('../../persistence')
const supertest = require('supertest')
const { generateTraces, generateToken, login, raiseGqlErr } = require('./utils')

describe('userCreate', () => {
  test('can create user', async () => {
    const request = supertest.agent(app)
    const email = 'xyz@xyz.com'
    const query = `
      mutation ul {
        userLogin(email: "${email}")
      }
    `

    await request
      .post('/api/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)

    const user = await User.find(email)
    expect(user).toHaveProperty('email', email)
  })
})

describe('Session', () => {
  test('basics session', async () => {
    const request = supertest.agent(app)
    const email = 'xyz@xyz.com'

    const user = await User.create(email)
    expect(user).toHaveProperty('isVerified', false)

    const userQuery = `
      query testUser {
        user {
          id
          email
          createdAt
          isVerified
        }
      }
    `

    await request
      .post('/api/graphql')
      .send({ query: userQuery })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)
      .then(res => {
        const body = res.body
        expect(res.body.data.user).toBeNull()
      })

    const token = await generateToken(user)
    await login(request, token)

    await request
      .post('/api/graphql')
      .send({ query: userQuery })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)
      .then(res => {
        const body = res.body
        const u = res.body.data.user
        expect(u).toHaveProperty('email', email)
        expect(u).toHaveProperty('id', user.id)
        expect(u).toHaveProperty('createdAt')
        expect(u).toHaveProperty('isVerified', true)
      })
  })
})
