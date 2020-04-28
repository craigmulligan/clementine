const { app } = require('../index')
const proto = require('apollo-engine-reporting-protobuf')
const zlib = require('zlib')
const promisify = require('util').promisify
const gzip = promisify(zlib.gzip)
const { Trace, Graph, User, sql, Key, db } = require('../persistence')
const { forwardQueue } = require('./queue')
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

    const res = await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':' + key.secret)
      .send(compressed)
      .expect(201)

    expect(res.body.id).toBeDefined()
  })

  test('Forward to Apollo Engine', async () => {
    const compressed = await formatProto('./__data__/traces.json')
    const request = supertest.agent(app)

    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const key = await Key.create(graph.id)

    const apolloApiKey = '123:xxxx'

    const res = await request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .set('x-api-key', graph.id + ':' + key.secret + '?' + apolloApiKey)
      .send(compressed)
      .expect(201)

    expect(res.body.id).toBeDefined()
    const jobs = await forwardQueue.getJobs()
    expect(jobs.length).toBe(1)
  })
})
