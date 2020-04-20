const { app } = require('../../index')
const { User, Graph } = require('../../persistence')
const supertest = require('supertest')
const { generateTraces, generateToken, login, raiseGqlErr } = require('./utils')
const logger = require('loglevel')

describe('graph', () => {
  test('create', async () => {
    const email = 'xx@gmail.com'
    const request = supertest.agent(app)
    const user = await User.create(email)
    const token = await generateToken(user)
    await login(request, token)

    const query = `
        mutation cg {
          graphCreate(name: "myGraph") {
            id
            user {
              id
              email
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
      .then(raiseGqlErr)
      .then(res => {
        const body = res.body
        expect(res.body.data.graphCreate.user).toHaveProperty('id', user.id)

        const graph = res.body.data.graphCreate
        expect(graph).toHaveProperty('id')
        expect(graph).toHaveProperty('name')
      })
  })

  describe('show', () => {
    test('happy path :)', async () => {
      const email = 'xx@gmail.com'
      const request = supertest.agent(app)
      const user = await User.create(email)
      const token = await generateToken(user)
      await login(request, token)

      const graph1 = await Graph.create('myGraph', user.id)
      const graph2 = await Graph.create('mySecondGraph', user.id)

      const query = `
        query gv {
          graph(graphId: "${graph2.id}") {
            id
            name
          }
        }
      `

      await request
        .post('/api/graphql')
        .send({ query })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then(raiseGqlErr)
        .then(res => {
          const body = res.body
          const g = res.body.data.graph
          expect(g.id).toBe(graph2.id)
          expect(g).toHaveProperty('name', 'mySecondGraph')
        })
    })

    test('only member can view', async done => {
      const email = 'xx@gmail.com'
      const email2 = 'xy@gmail.com'
      const request = supertest.agent(app)
      const user = await User.create(email)
      const user2 = await User.create(email2)
      const token = await generateToken(user)
      await login(request, token)

      const graph1 = await Graph.create('myGraph', user.id)
      const graph2 = await Graph.create('mySecondGraph', user2.id)

      const query = `
        query gv {
          graph(graphId: "${graph2.id}") {
            id
            name
          }
        }
      `

      // hide error to output in tests
      jest.spyOn(logger, 'error').mockImplementation(() => {})

      await request
        .post('/api/graphql')
        .send({ query })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then(res => {
          const errors = res.body.errors
          expect(errors[0].extensions.code).toContain('FORBIDDEN')
          done()
        })
    })
  })

  test('list', async () => {
    const email = 'xx@gmail.com'
    const request = supertest.agent(app)
    const user = await User.create(email)
    const token = await generateToken(user)
    await login(request, token)

    const graph1 = await Graph.create('myGraph', user.id)
    const graph2 = await Graph.create('mySecondGraph', user.id)

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
      .then(raiseGqlErr)
      .then(res => {
        const body = res.body
        expect(res.body.data.user.graphs.length).toBe(2)

        for (g of res.body.data.user.graphs) {
          expect(g).toHaveProperty('id')
          expect(g).toHaveProperty('name')
        }
      })
  })
})
