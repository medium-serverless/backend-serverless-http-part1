const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URI)
require('../../models/User')
const User = mongoose.model('User')

module.exports.postUsers = async (event, context) => {
  const user = new User()

  user.username = event.body.user.username
  user.email = event.body.user.email
  user.setPassword(event.body.user.password)

  await user.save().catch(e => {

    throw new Error("User validation failed: username: is already taken., email: is already taken.")
  })

  return { user: user.toAuthJSON() }
}