import Parse from 'parse'

export default {
  async logIn (email, password) {
    let message = { success: true, message: '' }
    try {
      const user = await Parse.User.logIn(email.toLowerCase(), password)
      console.log(user)
    } catch (error) {
      message.success = false
      switch (error.code) {
        case 101:
          message.message = 'Invalid email and password'
      }
    }
    return message
  },

  logOut () {
    return Parse.User.logOut()
  },

  isLoggedIn () {
    return Parse.User.current() !== null
  },

  async signUp (username, email, password) {
    // Reset the session and force current user logout
    if (Parse.User.current()) Parse.User.logOut()

    let user = new Parse.User()
    email = email.toLowerCase()
    user.set('username', email)
    user.set('email', email)
    user.set('password', password)
    user.set('nickname', username)
    let message = { success: true }
    try {
      await user.signUp()
    } catch (error) {
      message = { success: false, message: '' }
      switch (error.code) {
        case 209:
          message.message = 'Current user has not logged out'
          break
        case 202:
          message.message = 'This email has been registered'
          break
        case 125:
          message.message = 'The email is invalid'
      }
    }
    return message
  }
}
