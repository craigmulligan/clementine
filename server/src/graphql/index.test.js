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
  beforeEach(async () => {
    await exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump.psql`
    )
  })

  test('can list by graph', async () => {
    await exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump.psql`
    )
    const request = require('supertest').agent(app)
    const graphId = '770101a9-c787-406c-8ce1-9b22f3349d0a'
    await userLogin(request, 'x@x.com', '123')

    from = new Date('2020-04-04')
    to = new Date('2020-04-07')

    const query = `
      query cg {
        operations(graphId: "${graphId}", to: "${to}" from: "${from}") {
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
        expect(nodes.length).toBe(6)
        expect(firstNode).toHaveProperty('key')
        expect(firstNode.stats).toHaveProperty('count', 63)
        expect(firstNode.stats).toHaveProperty('duration')
      })
  })

  test('can order by duration', async () => {
    await exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump.psql`
    )
    const request = require('supertest').agent(app)
    const graphId = '770101a9-c787-406c-8ce1-9b22f3349d0a'
    await userLogin(request, 'x@x.com', '123')
    from = new Date('2020-04-04')
    to = new Date('2020-04-07')

    const orderBy = {
      field: 'duration',
      asc: true
    }

    const query = `
      query cg {
        operations(graphId: "${graphId}", to: "${to}", from: "${from}" orderBy: { field: duration, asc: false }) {
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
    await exec(
      `psql postgres://user:pass@postgres:5432/db < ${__dirname}/__data__/dump.psql`
    )
    const request = require('supertest').agent(app)
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
