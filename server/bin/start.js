const { app } = require('../src/')
const port = process.env.PORT
const logger = require('loglevel')
if (process.env.LOG_LEVEL != null) logger.setLevel(process.env.LOG_LEVEL)

app.listen(port, () => {
  logger.info(`App started on port ${port}`)
})
