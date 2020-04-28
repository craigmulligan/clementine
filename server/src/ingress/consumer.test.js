const proto = require('apollo-engine-reporting-protobuf')
const { thresholdQueue, ingestQueue } = require('./queue')
const { ingest, cull } = require('./consumer')
const { Trace, User, Graph } = require('../persistence')

function nowTill(from, to) {
  if (!to) {
    to = new Date()
  }
  if (!from) {
    from = new Date(0)
  }

  return {
    from,
    to
  }
}

describe('ingress ingest', () => {
  test('Happy path', async () => {
    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const messageJSON = require('./__data__/traces.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)

    const job = await ingestQueue.add({
      ...message,
      graphId: graph.id
    })

    await ingest(thresholdQueue)(job)

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
    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const messageJSON = require('./__data__/traces-with-error.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)
    const job = await ingestQueue.add({
      ...message,
      graphId: graph.id
    })

    await ingest(thresholdQueue)(job)
    const to = new Date('2020-04-20')
    const from = new Date('2020-03-20')

    const traces = await Trace.findAll(
      [{ field: 'graphId', operator: 'eq', value: graph.id }],
      { to, from }
    )
    expect(traces.length).toBe(2)
    expect(traces[0]).toHaveProperty('hasErrors', false)
    expect(traces[1]).toHaveProperty('hasErrors', true)
  })

  test('cull should be called', async () => {
    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const messageJSON = require('./__data__/traces.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)

    const job = await ingestQueue.add({
      ...message,
      graphId: graph.id
    })

    const mock = {
      add: jest.fn()
    }

    await ingest(mock)(job)
    const expectedArgs = { threshold: 1 }
    expect(mock.add).toBeCalledWith(expectedArgs)

    // Cull is called async so lets call it ourselves
    await cull({ data: expectedArgs })
    const traces = await Trace.findAll(
      [{ field: 'graphId', operator: 'eq', value: graph.id }],
      { to: new Date(), from: new Date(0) }
    )
    expect(traces.length).toBe(1)
    // now that it is culled the mock should only be called once.
    await ingest(mock)(job)

    // Cull should have deleted traces.

    expect(mock.add.mock.calls.length).toBe(1)
  })
})
