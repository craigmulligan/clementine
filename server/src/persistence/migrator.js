const path = require('path')
const migrate = require('migrate')

const stateStore = require('./postgres-state-storage')
const migrationsDirectory = path.resolve(__dirname, '../migrations')

const [command] = process.argv.slice(2)

const runMigration = command => {
  return new Promise((resolve, reject) => {
    migrate.load(
      {
        stateStore,
        migrationsDirectory
      },
      (err, set) => {
        if (err) {
          reject(err)
        }

        if (typeof set[command] !== 'function') {
          reject(new Error('Command is not a function'))
        }

        set[command](err => {
          if (err) reject(err)
          resolve()
        })
      }
    )
  })
}

module.exports = { runMigration }
