const { FullTracesReport } = require('apollo-engine-reporting-protobuf')
const proto = require('apollo-engine-reporting-protobuf')
const { extractErrors } = require('./utils')

describe('extractErrors', () => {
  const messageJSON = require('./__data__/traces-with-error.json')
  const instance = proto.FullTracesReport.fromObject(messageJSON)
  const message = proto.FullTracesReport.toObject(instance, {
    enums: String, // enums as string names
    longs: String, // longs as strings (requires long.js)
    bytes: String, // bytes as base64 encoded strings
    defaults: true, // includes default values
    arrays: true, // populates empty arrays (repeated fields) even if defaults=false
    objects: true, // populates empty objects (map fields) even if defaults=false
    oneofs: true // includes virtual oneof fields set to the present field's name
  })
  test('should find 1 error', () => {
    const key =
      '# showGraph\nquery showGraph($graphId:ID!){graph(graphId:$graphId){__typename id keys{__typename id secret}name operations{__typename count duration id}}}'

    const root = message.tracesPerQuery[key].trace[0].root
    const errors = extractErrors(root)

    expect(errors).toEqual([
      {
        message: 'Dummy Error',
        location: [{ line: 5, column: 5 }],
        json:
          '{"message":"Dummy Error","locations":[{"line":5,"column":5}],"path":["graph","keys"]}',
        timeNs: '0'
      }
    ])
  })

  test('should find 0 error', () => {
    const key = '# -\n{user{__typename graphs{__typename id name}id}}'

    const root = message.tracesPerQuery[key].trace[0].root
    const errors = extractErrors(root)

    expect(errors).toEqual([])
  })
})
