'use strict'
var admin = require('firebase-admin')
var https = require('https')
var nodemailer = require('nodemailer')
var serviceAccount = require('./config/credentials.json')
var smtpConfig = require('./config/smtpConfig.json')

function sendEmail (ip) {

  let transporter = nodemailer.createTransport(smtpConfig)

  var mailOptions = {
    from: 'node@emamian.se',
    to: 'nariman@emamian.se',
    subject: 'IP Update required!',
    text: 'The new ip should be: ' + ip
  }

  return transporter.sendMail(mailOptions)
}

var actualIp, storedIp

var options = {
  host: 'api.ipify.org',
  port: 443,
  path: '/?format=json',
  method: 'GET'
}

var req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  res.on('end', () => {
    actualIp = JSON.parse(data).ip
  })
})
// write data to request body
/*req.write('data\n')
req.write('data\n')*/
req.end()

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://ipbroadcast-7667b.firebaseio.com/'
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
