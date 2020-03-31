const { runMigration } = require('../src/persistence/migrator')

const [command] = process.argv.slice(2)

runMigration(command)
  .then(() => {
    console.log(`migrations "${command}" successfully ran`)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0)
  })
  .catch(error => {
    console.error(error.stack)
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  })
