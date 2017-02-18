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

import * as TaskStorage from './models/storage/task-storage'
import * as ListStorage from './models/storage/list-storage'
import * as ProfileStorage from './models/storage/profile-storage'

async function getInitialState() {

  let tasks = {}
  let lists = {}
  let profile = {}
  let isLoggedIn = false

  try {
    tasks = await TaskStorage.getAllTasks()
  } catch (err) { /* ignore */ }

  try {
    lists = await ListStorage.getAllLists()
  } catch (err) { /* ignore */ }

  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    entities: {
      tasks: tasks,
      lists: lists
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
