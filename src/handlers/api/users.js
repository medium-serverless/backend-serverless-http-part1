const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
require('../../models/User')
const User = mongoose.model('User')

module.exports.postUsers = async (event, context) => {
  console.log('new fancy lambda')
  throw new Error('Missing required property')
  // throw new Error('[400] trying throwing 400s')
  const user = new User()


  user.username = event.body.user.username
  user.email = event.body.user.email
  user.setPassword(event.body.user.password)

  //
  // user.username = 'hej'
  // user.email = 'hej@gmail.com'
  // user.setPassword('hej')

  await user.save()
  return { user: user.toAuthJSON() }

}