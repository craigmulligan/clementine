const { runMigration } = require('./persistence/migrator')
const { redis } = require('./persistence')

beforeEach(async () => {
  await runMigration('up')
  await redis.flushdb()
})
afterEach(async () => {
  await runMigration('down')
})
