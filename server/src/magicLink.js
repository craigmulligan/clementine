const uuid = require('uuid/v4')
const promisify = require('util').promisify
const redis = require('./redis')
const email = require('./email')
const get = promisify(redis.get).bind(redis)
const set = promisify(redis.set).bind(redis)
const sendEmail = promisify(email.send).bind(email)
const prefix = 'magicLink'

const domain = process.env.domain || 'http://localhost:5000'

async function generate(data) {
  const token = uuid()
  await set(`${prefix}:${token}`, JSON.stringify(data))
  return [token, `${domain}/graph?token=${token}`]
}

async function verify(token) {
  const data = await get(`${prefix}:${token}`)
  return JSON.parse(data)
}

async function send(user) {
  const [token, link] = await generate(user)
  if (process.env.NODE_ENV === 'test') {
    return
  }

  return sendEmail({
    text: `Follow this link to login ${link}`,
    subject: 'Clementine signin',
    from: 'hobochildster@gmail.com',
    to: user.email
  })
}

module.exports = {
  verify,
  generate,
  send
}
