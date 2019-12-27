const serverless = require('serverless-http')
const app = require('./app/app.js')
const ourExpressApp = serverless(app)
module.exports.handler = async (event, context) => {
  // this is before your express app/code runs
  let result = await ourExpressApp(event, context)
  // here express' work is done and ready to reply
  return result
}