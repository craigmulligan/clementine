const { app } = require('../index')
const { db, User, Graph, Key, Trace, sql } = require('../persistence')
const { prepareTraces } = require('../api/utils')
const proto = require('apollo-engine-reporting-protobuf')
const { runMigration } = require('../persistence/migrator')
const uuid = require('uuid/v4')
const exec = require('util').promisify(require('child_process').exec)

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
    .then(raiseGqlErr)
    .then(res => {
      const body = res.body

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
    .then(raiseGqlErr)
    .then(res => {
      const body = res.body
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
      .then(raiseGqlErr)
      .then(res => {
        const body = res.body

        expect(res.body.data.user).toHaveProperty('email')
      })
  })
})

describe('graph', () => {
  test('create', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)

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

  test('show', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
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

  test('list', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
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
  test('create', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
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

  test('list', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)

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
  test('can list by graph', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
    const graph = await Graph.create('myGraph', user.id)

    const messageJSON = require('../api/__data__/traces.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)
    const traces = prepareTraces(message)
    const results = await Trace.create(graph.id, traces)

    const query = `
      query cg {
        operations(graphId: "${graph.id}") {
          nodes {
            id
            key
            keyMetrics {
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
        expect(nodes.length).toBe(1)
        expect(firstNode).toHaveProperty(
          'key',
          Buffer.from(firstNode.id, 'base64').toString()
        )
        expect(firstNode.keyMetrics).toHaveProperty('count', 2)
        expect(firstNode.keyMetrics).toHaveProperty('duration')
      })
  })

  async function createTraces(graph, objs) {
    for (obj of objs) {
      const message = proto.FullTracesReport.fromObject(obj)
      const traces = prepareTraces(message)
      await Trace.create(graph.id, traces)
    }
  }

  test('can order by duration', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
    const graph = await Graph.create('myGraph', user.id)
    await createTraces(
      graph,
      [
        '../api/__data__/traces.json',
        '../api/__data__/traces-with-error.json'
      ].map(require)
    )

    const orderBy = {
      field: 'duration',
      asc: true
    }

    const query = `
      query cg {
        operations(graphId: "${graph.id}", orderBy: { field: duration, asc: false }) {
          nodes {
            id
            key
            keyMetrics {
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
        expect(nodes.length).toBe(3)
        expect(nodes[0].keyMetrics.duration).toBeGreaterThan(
          nodes[1].keyMetrics.duration
        )
        expect(nodes[1].keyMetrics.duration).toBeGreaterThan(
          nodes[2].keyMetrics.duration
        )
      })
  })

  test('can paginate with Cursor', async () => {
    const request = require('supertest').agent(app)
    const email = 'xx@gmail.com',
      password = 'yy'
    const user = await User.create(email, password)
    await userLogin(request)
    const graph = await Graph.create('myGraph', user.id)
    // load alot of traces (does not matter that they are dupes)
    const queryKeys = [...Array(50).keys()].map(() => uuid())

    const traceObjs = queryKeys.map(k => {
      const template = require('../api/__data__/traces.json')
      // here we just assign all the current traces to a new opId (uuid)
      template.tracesPerQuery[k] =
        template.tracesPerQuery['# GET_USER\nquery GET_USER{user{email id}}']
      return template
    })

    await createTraces(graph, traceObjs)

    const query = `
      query cg {
        operations(graphId: "${graph.id}") {
          nodes {
            id
            key
            keyMetrics {
              count
              duration
            }
          }
          cursor
        }
      }
    `

    const res = await request
      .post('/api/graphql')
      .send({ query })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)

    expect(res.body.data.operations.nodes.length).toBe(6)

    const queryWithCursor = `
      query cg {
        operations(graphId: "${graph.id}", after: "${res.body.data.operations.cursor}") {
          nodes {
            id
            key
            keyMetrics {
              count
              duration
            }
          }
          cursor
        }
      }
    `

    const resWithCursor = await request
      .post('/api/graphql')
      .send({ query: queryWithCursor })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .then(raiseGqlErr)

    expect(resWithCursor.body.data.operations.nodes.length).toBe(6)
    // check that nothing from the first response is in the second.
    for (node of resWithCursor.body.data.operations.nodes) {
      expect(res.body.data.operations.nodes).not.toContainEqual(node)
    }
  })

  describe('timeline', () => {
    beforeEach(async () => {
      await exec(
        `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/db_dump.psql`
      )
    })

    test.only('can query timeline by graph', async () => {
      const request = require('supertest').agent(app)
      await userLogin(request, 'x@x.com', '123')
      const graphId = '03a74877-ccc1-402d-984c-6ff170ab4690'

      const query = `
        query tl {
          timeline(graphId: "${graphId}") {
            nodes {
              id
              bins {
                id
                count
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
          const nodes = res.body.data.timeline.nodes
          expect(nodes.length).toBe(7)
        })
    })
  })
})
