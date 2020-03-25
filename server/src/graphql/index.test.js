const { app } = require('../index')
const db = require('../persistence/db')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

function userCreate(request, email = 'hobohobo@gmail.com', password = 'yyy') {
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
        console.log(body.errors[0].extensions.exception)
        throw Error(body.errors)
      }

      return res.body.data.userCreate
    })
}

function userLogin(request, email = 'xx@gmail.com', password = 'yy') {
  const query = `
      mutation testUserLogin {
        userLogin(email: "${email}", password: "${password}") {
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
    .then(res => {
      const body = res.body
      if (body.errors) {
        throw Error(body.errors)
      }

      return res.body.data.userLogin
    })
}

describe('userCreate', () => {
  test('can create user', async () => {
    const request = require('supertest').agent(app)
    const user = await userCreate(request)
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
  })
})

describe('Session', () => {
  test('basics session', async () => {
    const request = require('supertest').agent(app)
    await userCreate(request)
    await userLogin(request)

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
      .send({ query: userQuery })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        const body = res.body
        if (body.errors) {
          throw Error(body.errors)
        }

        expect(res.body.data.user).toHaveProperty('email')
      })
  })
})

describe('graph', () => {
  test('basics', async () => {
    const request = require('supertest').agent(app)
    await userCreate(request)
    await userLogin(request)

    const CREATE_GRAPH = `
      mutation cg {
        graphCreate(name: "myGraph") {
          id
          user {
            id
          }
          name
        }
      }
    `

    await request
      .post('/api/graphql')
      .send({ query: CREATE_GRAPH })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        const body = res.body
        if (body.errors) {
          throw Error(body.errors)
        }

        expect(res.body.data.graphCreate).toHaveProperty('id')
        expect(res.body.data.graphCreate).toHaveProperty('user')
        expect(res.body.data.graphCreate).toHaveProperty('name')
      })
  })
})
