const { runMigration } = require('./persistence/migrator')

beforeEach(async () => {
  await runMigration('up')
})
afterEach(async () => {
  await runMigration('down')
})
