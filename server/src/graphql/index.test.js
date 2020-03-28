const { app } = require('../index')
const { db, User, Graph, Key } = require('../persistence')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

function userCreate(request, email = 'xx@gmail.com', password = 'yy') {
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
    const email = 'xx@gmail.com',
      password = 'yy'
    const request = require('supertest').agent(app)
    await User.create(email, password)
    await userLogin(request, email, password)

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

function createGraph(request, name = 'myGraph') {
  const query = `
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

      return res.body.data.graphCreate
    })
}

function createKey(request, graphId) {
  const query = `
      mutation cg {
        keyCreate(graphId: "${graphId}") {
          id
          secret
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

      return res.body.data.keyCreate
    })
}

describe('graph', () => {
  test('basics', async () => {
    const request = require('supertest').agent(app)
    await userCreate(request)
    await userLogin(request)
    const graph = await createGraph(request)

    expect(graph).toHaveProperty('id')
    expect(graph).toHaveProperty('name')

    const VIEW_GRAPH = `
      query lg {
        user {
          id
          graphs {
            id
            name
          }
        }
      }
    `

    await request
      .post('/api/graphql')
      .send({ query: VIEW_GRAPH })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(res => {
        const body = res.body
        if (body.errors) {
          throw Error(body.errors)
        }

        for (g of res.body.data.user.graphs) {
          expect(g).toHaveProperty('id')
          expect(g).toHaveProperty('name')
        }
      })
  })
})

describe('keys', () => {
  test('basics', async () => {
    const request = require('supertest').agent(app)
    await userCreate(request)
    await userLogin(request)
    const graph = await createGraph(request)

    const key = await createKey(request, graph.id)
    expect(key).toHaveProperty('id')
    expect(key).toHaveProperty('secret')
  })
})
