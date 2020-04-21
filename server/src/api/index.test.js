const { app } = require('../index')
const proto = require('apollo-engine-reporting-protobuf')
const zlib = require('zlib')
const promisify = require('util').promisify
const gzip = promisify(zlib.gzip)
const { Trace, Graph, User, sql, Key, db } = require('../persistence')
const { runMigration } = require('../persistence/migrator')
const supertest = require('supertest')

function formatProto(path) {
  const messageJSON = require(path)
  const message = proto.FullTracesReport.fromObject(messageJSON)
  const buffer = proto.FullTracesReport.encode(message).finish()
  return gzip(buffer)
}

describe('/api/ingress', () => {
  test('No ApiKey', async () => {
    const compressed = await formatProto('./__data__/traces.json')
    const request = supertest.agent(app)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .send(compressed)
      .expect(403)
  })

  test('Invalid ApiKey', async () => {
    const compressed = await formatProto('./__data__/traces.json')
    const request = supertest.agent(app)
    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':123')
      .send(compressed)
      .expect(403)
  })

  test('uncompressed', async () => {
    const request = supertest.agent(app)
    const messageJSON = require('./__data__/traces.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)
    const buffer = proto.FullTracesReport.encode(message).finish()

    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const key = await Key.create(graph.id)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('x-api-key', graph.id + ':' + key.secret)
      .send(buffer)
      .expect(201)
  })

  test('Happy path', async () => {
    const compressed = await formatProto('./__data__/traces.json')
    const request = supertest.agent(app)

    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const key = await Key.create(graph.id)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':' + key.secret)
      .send(compressed)
      .expect(201)

    const to = new Date('2020-04-20')
    const from = new Date('2020-03-20')

    const traces = await Trace.findAll(
      [{ field: 'graphId', operator: 'eq', value: graph.id }],
      { to, from }
    )
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

  test('happy path - with errors', async () => {
    const compressed = await formatProto('./__data__/traces.json')
    const request = supertest.agent(app)

    const user = await User.create('email@email.com', '123')
    const graph = await Graph.create('myGraph', user.id)
    const key = await Key.create(graph.id)

    // TODO create graph
    await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':' + key.secret)
      .send(compressed)
      .expect(201)

    const to = new Date('2020-04-20')
    const from = new Date('2020-03-20')

    const traces = await Trace.findAll(
      [{ field: 'graphId', operator: 'eq', value: graph.id }],
      { to, from }
    )
    expect(traces.length).toBe(2)
    const t = traces[0]
    expect(t).toHaveProperty('id')
    expect(t).toHaveProperty('graphId', graph.id)
    expect(t).toHaveProperty('duration')
    expect(t).toHaveProperty('startTime')
    expect(t).toHaveProperty('endTime')
    expect(t).toHaveProperty('root')
    expect(t).toHaveProperty('clientName')
    expect(t).toHaveProperty('clientVersion')
  })
})
