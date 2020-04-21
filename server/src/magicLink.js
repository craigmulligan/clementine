const uuid = require('uuid/v4')
const promisify = require('util').promisify
const { redis } = require('./persistence')
const email = require('./email')
const get = promisify(redis.get).bind(redis)
const set = promisify(redis.set).bind(redis)
const sendEmail = promisify(email.send).bind(email)
const crypto = require('crypto')
const prefix = 'magicLink'

function hash(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('hex')
}

const domain = process.env.domain || 'http://localhost:5000'

async function generate(data) {
  const token = uuid()
  await set(`${prefix}:${hash(token)}`, JSON.stringify(data))
  return [token, `${domain}/graph?token=${token}`]
}

async function verify(token) {
  const data = await get(`${prefix}:${hash(token)}`)
  return JSON.parse(data)
}

async function send(user) {
  const [token, link] = await generate(user)

  return sendEmail({
    text: `Follow this ${link} to login.`,
    subject: 'Clementine Signin',
    from: process.env.SMTP_EMAIL_FROM,
    to: user.email
  })
}

module.exports = {
  verify,
  generate,
  send
}
