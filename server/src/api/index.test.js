const { app } = require('../index')
const db = require('../persistence/db')
const { FullTracesReport } = require('apollo-engine-reporting-protobuf')
const fs = require('fs')

beforeEach(() => {
  return db.query('START TRANSACTION')
})
afterEach(() => {
  return db.query('ROLLBACK')
})

describe('/api/ingress', () => {
  test('Happy path', () => {
    const message = fs.readFileSync(`${__dirname}/message-base64.txt`, 'base64')
    const request = require('supertest').agent(app)

    return request
      .post('/api/ingress/traces')
      .set('content-encoding', 'gzip')
      .send(message)
      .expect(200)
      .then(res => {
        console.log(res.body)
        throw Error('ha')
      })
  })
})
