const express = require('express')

const { Router } = express
const router = new Router()

const user = require('./user')

router.use('/api/users', user)

module.exports = router
