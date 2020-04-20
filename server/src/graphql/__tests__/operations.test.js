const { app } = require('../../index')
const { User, Graph, Trace } = require('../../persistence')
const supertest = require('supertest')
const { generateTraces, generateToken, login, raiseGqlErr } = require('./utils')

describe('operations', () => {
  test('can list by graph', async () => {
    const email = 'xx@gmail.com'
    const request = supertest.agent(app)
    const user = await User.create(email)
    const graph = await Graph.create('myGraph', user.id)
    const token = await generateToken(user)
    await login(request, token)

    const traces = await generateTraces(50)
    await Trace.create(graph.id, traces)

    const query = `
      query cg {
        operations(graphId: "${graph.id}") {
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
        expect(firstNode.stats).toHaveProperty('count')
        expect(firstNode.stats).toHaveProperty('duration')
      })
  })
})

test('can order by duration', async () => {
  const email = 'xx@gmail.com'
  const request = supertest.agent(app)
  const user = await User.create(email)
  const graph = await Graph.create('myGraph', user.id)
  const token = await generateToken(user)
  await login(request, token)

  const traces = await generateTraces(50)
  await Trace.create(graph.id, traces)

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
      expect(nodes.length).toBe(10)

      nodes.forEach((node, i) => {
        if (i !== nodes.length - 1) {
          expect(nodes[i].stats.duration).toBeGreaterThan(
            nodes[i + 1].stats.duration
          )
        }
      })
    })
})

test('can paginate with Cursor', async () => {
  const email = 'xx@gmail.com'
  const request = supertest.agent(app)
  const user = await User.create(email)
  const graph = await Graph.create('myGraph', user.id)
  const token = await generateToken(user)
  await login(request, token)

  const traces = await generateTraces(50)
  await Trace.create(graph.id, traces)

  const runQuery = cursor => {
    const query = `
    query cg {
      operations(graphId: "${graph.id}", after: "${cursor}") {
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
