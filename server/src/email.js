const emailjs = require('emailjs')

const email = emailjs.server.connect({
  user: process.env.SMTP_EMAIL,
  password: process.env.SMTP_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: true,
  port: 465
})

module.exports = email
