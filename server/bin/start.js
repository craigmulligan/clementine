const { app } = require('../src/')
const port = process.env.PORT
const logger = require('loglevel')

app.listen(port, () => {
  logger.info(`App started on port ${port}`)
})
