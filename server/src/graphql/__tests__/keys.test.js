const { app } = require('../../index')
const { User, Graph, Trace, Key } = require('../../persistence')
const supertest = require('supertest')
const { generateTraces, generateToken, login, raiseGqlErr } = require('./utils')
const logger = require('loglevel')

describe('keys', () => {
  describe('create', () => {
    test('happy path :)', async () => {
      const email = 'xx@gmail.com'
      const request = supertest.agent(app)
      const user = await User.create(email)
      const token = await generateToken(user)
      await login(request, token)

      const graph = await Graph.create('myGraph', user.id)

      const query = `
        mutation cg {
          keyCreate(graphId: "${graph.id}") {
            id
            secret
            graph {
              id
            }
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
          const key = res.body.data.keyCreate
          expect(key).toHaveProperty('id')
          expect(key).toHaveProperty('graph.id', graph.id)
          expect(key).toHaveProperty('secret')
          expect(key.secret.split(':')[0]).toBe(graph.id)
        })
    })

    test('only member can create key', async done => {
      const email = 'xx@gmail.com'
      const email2 = 'xy@gmail.com'
      const request = supertest.agent(app)
      const user = await User.create(email)
      const user2 = await User.create(email2)
      const token = await generateToken(user)
      await login(request, token)

      const graph = await Graph.create('myGraph', user.id)
      const graph2 = await Graph.create('myGraph', user2.id)

      const query = `
        mutation cg($graphId: ID!) {
          keyCreate(graphId: $graphId) {
            id
            secret
            graph {
              id
            }
          }
        }
      `

      // hide error to output in tests
      jest.spyOn(logger, 'error').mockImplementation(() => {})
      return request
        .post('/api/graphql')
        .send({ query, variables: { graphId: graph2.id } })
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

    const graph = await Graph.create('myGraph', user.id)
    const graph2 = await Graph.create('mm', user.id)
    const key1 = await Key.create(graph.id)
    const key2 = await Key.create(graph.id)
    const key3 = await Key.create(graph2.id)

    const query = `
      query cg {
        user {
          graphs {
            id
            keys {
              id
            }
          }
        }
      }
    `

    await request
      .post('/api/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)
      .then(async res => {
        const body = res.body
        const g1 = res.body.data.user.graphs.find(g => g.id === graph.id)
        expect(g1.keys.length).toBe(2)
        expect(g1.keys).toContainEqual({ id: key1.id })
        expect(g1.keys).toContainEqual({ id: key2.id })

        const g2 = res.body.data.user.graphs.find(x => x.id === graph2.id)
        expect(g2.keys.length).toBe(1)
        expect(g2.keys).toContainEqual({ id: key3.id })
      })
  })
})
