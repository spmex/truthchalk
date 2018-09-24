import Parse from 'parse'
import auth from './auth'
import db from './database'

Parse.initialize('truthchalk')
Parse.serverURL = 'http://truthchalk.us-east-1.elasticbeanstalk.com/parse'

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    // Response to the content.js for isLoggedIn info
    case 'isLoggedIn':
      sendResponse({ isLoggedIn: auth.isLoggedIn() })
      break

    // Save an annotation with new numbers of votes and user vote.
    // TODO: this is atomic and we need to reverse back if the second save fails
    case 'saveAnnotation':
      db.saveAnnotation(
        request.text, request.id, request.increment, Parse.User.current()
      ).then((annotation) => db.saveUserAnnotation(
        Parse.User.current(), annotation, request.vote, request.source
      )).then((userAnnotation) => {
        sendResponse({ id: userAnnotation.get('annotation').id })
      }).catch((error) => console.log(error))
      break

    // Query the sentences and return the voted record
    case 'queryTexts':
      // Step 1: Query all the input sentences in the database
      db.queryAllAnnotations(request.texts).then((annotations) => {
        let texts = {}
        for (let t of annotations) {
          texts[t.id] = {
            text: t.get('text'),
            votes: [t.get('numTrue'), t.get('numFalse'), 0]
          }
        }
        // Step 2: Query the sentences voted by current user in the results
        if (annotations) {
          db.queryMultipleUserAnnotations(
            Parse.User.current(), annotations
          ).then((userAnnotations) => {
            for (let uA of userAnnotations) {
              texts[uA.get('annotation').id].votes[2] = uA.get('vote')
            }
            sendResponse({ texts: texts })
          }).catch((error) => console.log(error))
        }
      })
      break
  }
  return true
})

export default {
  // Check if a user has logged in
  isLoggedIn () {
    return auth.isLoggedIn()
  },

  // Login user with given info
  async logIn (email, password) {
    let message = await auth.logIn(email, password)
    // Send message to ALL content js to OPEN the popbar
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { isLoggedIn: message.success })
      }
    })
    return message
  },

  // Log out the current user
  async logOut () {
    await auth.logOut()
    // Send message to ALL content js to CLOSE the popbar
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { isLoggedIn: false })
      }
    })
  },

  // Sign up with given info
  async signUp (username, email, passwd) {
    let message = await auth.signUp(username, email, passwd)
    // Send message to ALL content js to TOGGLE the popbar
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { isLoggedIn: message.success })
      }
    })
    return message
  }
}
