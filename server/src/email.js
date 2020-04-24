const emailjs = require('emailjs')
const [host, user, password] = process.env.SMTP.split(':')

const email = emailjs.server.connect({
  user,
  password,
  host,
  ssl: true,
  port: 465
})

module.exports = email
