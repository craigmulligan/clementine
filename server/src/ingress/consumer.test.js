const proto = require('apollo-engine-reporting-protobuf')
const queue = require('./queue')
const consumer = require('./consumer')
const { Trace, User, Graph } = require('../persistence')

describe('ingress consumer', () => {
  test('Happy path', async () => {
    const user = await User.create('email@email.com')
    const graph = await Graph.create('myGraph', user.id)
    const messageJSON = require('./__data__/traces.json')
    const message = proto.FullTracesReport.fromObject(messageJSON)

    const job = await queue.add({
      ...message,
      graphId: graph.id
    })
    await consumer(job)

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
    const job = await queue.add({
      ...message,
      graphId: graph.id
    })
    await consumer(job)
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
})
