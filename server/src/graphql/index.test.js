const { app, magicLink } = require('../index')
const { db, User, Graph, Key, Trace, sql } = require('../persistence')
const { prepareTraces } = require('../api/utils')
const proto = require('apollo-engine-reporting-protobuf')
const { runMigration } = require('../persistence/migrator')
const uuid = require('uuid/v4')
const exec = require('util').promisify(require('child_process').exec)
const supertest = require('supertest')
const logger = require('loglevel')

beforeEach(async () => {
  await runMigration('up')
})
afterEach(async () => {
  await runMigration('down')
})

function raiseGqlErr(res) {
  if (res.body.errors) {
    throw Error(JSON.stringify(res.body.errors))
  }

  return res
}

async function generateToken(user) {
  const [token, _] = await magicLink.generate(user)
  return token
}

function login(request, token) {
  return request.get(`/magic?token=${token}`)
}

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

describe('operations', () => {
  beforeEach(done => {
    return exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump-new.psql`
    ).then(done)
  })
  test.only('can list by graph', async () => {
    // await exec(
    // `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump-new.psql`
    // )

    const request = supertest.agent(app)
    const email = 'x@x.com'
    const user = await User.find(email)
    const token = await generateToken(user)
    await login(request, token)
    const graphId = 'b0d7a91f-efc2-40d1-ac55-b89b4933ef58'

    const query = `
      query cg {
        operations(graphId: "${graphId}") {
          nodes {
            id
            key
            stats {
              count
              duration
            }
          }
          cursor
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
        const nodes = res.body.data.operations.nodes
        const firstNode = nodes[0]
        expect(nodes.length).toBe(10)
        expect(firstNode).toHaveProperty('key')
        expect(firstNode.stats).toHaveProperty('count', 336)
        expect(firstNode.stats).toHaveProperty('duration')
      })
  })

  test('can order by duration', async () => {
    await exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump-new.psql`
    )
    const request = supertest.agent(app)
    const email = 'x@x.com'
    const user = await User.find(email)
    const token = await generateToken(user)
    await login(request, token)
    const graphId = 'b0d7a91f-efc2-40d1-ac55-b89b4933ef58'

    const orderBy = {
      field: 'duration',
      asc: true
    }

    const query = `
      query cg {
        operations(graphId: "${graphId}", orderBy: { field: duration, asc: false }) {
          nodes {
            id
            key
            stats {
              count
              duration
            }
          }
          cursor
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
        const nodes = res.body.data.operations.nodes
        expect(nodes.length).toBe(6)
        expect(nodes[0].stats.duration).toBeGreaterThan(nodes[1].stats.duration)
        expect(nodes[1].stats.duration).toBeGreaterThan(nodes[2].stats.duration)
      })
  })

  test('can paginate with Cursor', async () => {
    // await exec(
    // `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump.psql`
    // )
    const request = supertest.agent(app)
    const graphId = '770101a9-c787-406c-8ce1-9b22f3349d0a'
    await userLogin(request, 'x@x.com', '123')
    from = new Date('2020-04-04')
    to = new Date('2020-04-07')

    const runQuery = cursor => {
      const query = `
        query cg {
          operations(graphId: "${graphId}", to: "${to}" from:"${from}" after: "${cursor}") {
            nodes {
            id
            key
            stats {
            count
            duration
            }
          }
          cursor
          }
        }
      `

      return request
        .post('/api/graphql')
        .send({ query: query })
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .then(raiseGqlErr)
    }

    let done = false
    let cursor = ''
    let results = []

    while (!done) {
      const res = await runQuery(cursor)
      results.concat(res.body.data.operations.nodes)
      if (res.body.data.operations.cursor === '') {
        done = true
      } else {
        cursor = res.body.data.operations.cursor
      }
    }

    results.map(op => {
      // make sure there are no duplicates in our results
      const isDupe = results.filter(o => o.id === op.id).map(({ id }) => id)
        .length
      expect(isDupe).toBeFalsy()
    })
  })
})
