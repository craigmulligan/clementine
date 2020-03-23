const { app } = require('../index')
const db = require('../persistence/db')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

describe('userCreate', () => {
  test('can create user', () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com'
    const password = 'y'

    const query = `
      mutation testUserCreate {
        userCreate(email: "${email}", password: "${password}") {
          id
          email
        }
      }
    `

    return request
      .post('/api/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .then(res => {
        const body = res.body

        if (body.errors) {
          throw Error(body.errors)
        }
        expect(res.body.data.userCreate).toHaveProperty('id')
        expect(res.body.data.userCreate).toHaveProperty('email', email)
      })
  })
})

describe('Session', () => {
  test('basics session', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com'
    const password = 'y'
    const userCreateQuery = `
      mutation testUserCreate {
        userCreate(email: "${email}", password: "${password}") {
          id
          email
        }
      }
    `

    const userLoginQuery = `
      mutation testUserLogin {
        userLogin(email: "${email}", password: "${password}") {
          id
          email
        }
      }
    `

    const userQuery = `
      query testUser {
        user {
          email
          id
        }
      }
    `

    await request
      .post('/api/graphql')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .send({ query: userCreateQuery })

    await request
      .post('/api/graphql')
      .send({ query: userLoginQuery })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        const body = res.body
        if (body.errors) {
          console.log(body.errors)
          throw Error(body.errors)
        }
      })

    await request
      .post('/api/graphql')
      .send({ query: userQuery })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        const body = res.body
        if (body.errors) {
          throw Error(body.errors)
        }

        expect(res.body.data.user).toHaveProperty('email', email)
      })
  })
})
