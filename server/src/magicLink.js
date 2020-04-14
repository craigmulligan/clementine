const uuid = require('uuid/v4')
const promisify = require('util').promisify

const magicLink = ({
  redis,
  host = 'localhost:3000',
  prefix = 'magicLink',
  email
}) => {
  const get = promisify(redis.get).bind(redis)
  const set = promisify(redis.set).bind(redis)
  const sendEmail = promisify(email.send).bind(email)

  async function generate(data) {
    const token = uuid()
    await set(`${prefix}:${token}`, JSON.stringify(data))
    return [token, `${host}/graph?token=${token}`]
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

    console.log('WARNING SENDING EMAIL')
    // return sendEmail({
    // text: `Follow this link to login ${link}`,
    // subject: 'Clementine signin',
    // from: 'hobochildster@gmail.com',
    // to: user.email
    // })
  }

  return {
    verify,
    generate,
    send
  }
}

module.exports = magicLink
