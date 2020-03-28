const { app } = require('../index')
const db = require('../persistence/db')
const { FullTracesReport } = require('apollo-engine-reporting-protobuf')
const proto = require('apollo-engine-reporting-protobuf')
const zlib = require('zlib')
const promisify = require('util').promisify
const gzip = promisify(zlib.gzip)
const uuid = require('uuid/v4')
const Trace = require('../persistence/traces')
const Graph = require('../persistence/graphs')
const User = require('../persistence/users')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

function formatProto(path) {
  const messageJSON = require(path)
  const message = proto.FullTracesReport.fromObject(messageJSON)
  const buffer = proto.FullTracesReport.encode(message).finish()
  return gzip(buffer)
}

describe('/api/ingress', () => {
  test('No ApiKey', async () => {
    const compressed = await formatProto('./dummy.json')
    const request = require('supertest').agent(app)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .send(compressed)
      .expect(403)
  })

  test('Happy path', async () => {
    const compressed = await formatProto('./dummy.json')
    const request = require('supertest').agent(app)

    const user = await User.create('email@email.com', '123')
    const graph = await Graph.create('myGraph', user.id)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':123')
      .send(compressed)
      .expect(201)

    const traces = await Trace.findAll({ graphId: graph.id })
    expect(traces.length).toBe(2)
    const t = traces[0]
    expect(t).toHaveProperty('id')
    expect(t).toHaveProperty('graphId')
    expect(t).toHaveProperty('duration')
    expect(t).toHaveProperty('startTime')
    expect(t).toHaveProperty('endTime')
    expect(t).toHaveProperty('root')
    expect(t).toHaveProperty('clientName')
    expect(t).toHaveProperty('clientVersion')
  })
})
