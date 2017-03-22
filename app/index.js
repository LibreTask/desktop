/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, hashHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'

import routes from './routes'
import configureStore from './store/configureStore'
import './app.global.css'

import AppConstants from './constants'

import * as MetaStorage from './models/storage/meta-storage'
import * as TaskStorage from './models/storage/task-storage'
import * as ProfileStorage from './models/storage/profile-storage'

/*
MetaStorage.getWindowSize()
.then(initialWindowSize => {
  const window = require('electron').BrowserWindow

  let initialWidth = initialWindowSize[MetaStorage.WINDOW_WIDTH]
      || AppConstants.INITIAL_WINDOW_WIDTH
  let initialHeight = initialWindowSize[MetaStorage.WINDOW_HEIGHT]
      || AppConstants.INITIAL_WINDOW_HEIGHT

  window.setSize(initialWidth, initialHeight)
  window.setSize(600, 600)
})
.catch(err => {
  window.setSize(600, 600)
})
*/

async function getInitialState() {

  let tasks = {}
  let profile = {}
  let isLoggedIn = false

  try {
    tasks = await TaskStorage.getAllTasks()
  } catch (err) { /* ignore */ }

  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    entities: {
      tasks: tasks
    },
    user: {
      profile: profile,
      isLoggedIn: isLoggedIn
    }
  }
}

getInitialState()
.then(initialState => {

  const store = configureStore(initialState)
  const history = syncHistoryWithStore(hashHistory, store)

  injectTapEventPlugin()

  render(
    <Provider store={store}>
      <Router history={history} routes={routes} />
    </Provider>,
    document.getElementById('root')
  )
})
