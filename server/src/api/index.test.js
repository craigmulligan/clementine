const { app } = require('../index')
const db = require('../persistence/db')
const { FullTracesReport } = require('apollo-engine-reporting-protobuf')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

describe('/api/ingress', () => {
  test('Happy path', () => {
    const report = {}
    const protobufError = FullTracesReport.verify(report)
    if (protobufError) {
      throw new Error(`Error encoding report: ${protobufError}`)
    }
    const message = FullTracesReport.encode(report).finish()
    const request = require('supertest').agent(app)

    return request
      .post('/api/ingress/traces')
      .send(message)
      .expect(200)
      .then(res => {
        console.log(res.body)
        throw Error('ha')
      })
  })
})
