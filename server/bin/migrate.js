const { runMigration } = require('../src/persistence/migrator')
const logger = require('loglevel')

const [command] = process.argv.slice(2)

runMigration(command)
  .then(() => {
    logger.info(`migrations "${command}" successfully ran`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  })
  .catch(error => {
    console.error(error.stack)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  })
