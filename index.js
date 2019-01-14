'use strict'
var admin = require('firebase-admin')
var https = require('https')
var nodemailer = require('nodemailer')
var config = require('./config/config.json')
var serviceAccount = require('./config/serviceAccount.json')
var smtpConfig = require('./config/smtpConfig.json')

var actualIp, storedIp

var options = {
  host: 'api.ipify.org',
  port: 443,
  path: '/?format=json',
  method: 'GET'
}

let data = ''
var req = https.request(options, (res) => {
  res.on('data', (chunk) => {
    data += chunk
  })
  res.on('end', () => {toDb()})
})

req.end()

// Write to Firebase if there is any change
function toDb () {
  actualIp = JSON.parse(data).ip
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.databaseURL
  })
  admin.database().ref('/').once('value').then((data) => {
    storedIp = data.val().ip

    if (actualIp !== storedIp) {
      sendEmail(actualIp)
        .then(() => admin.database().ref('/').update({ip: actualIp}))
        .then(() => process.exit())
    } else {
      process.exit()
    }
  })
}

// Notify user via email
function sendEmail (ip) {

  let transporter = nodemailer.createTransport(smtpConfig)

  var mailOptions = {
    from: config.mailFrom,
    to: config.mailTo,
    subject: 'IP Update required!',
    text: 'The new ip should be: ' + ip
  }

  return transporter.sendMail(mailOptions)
}
