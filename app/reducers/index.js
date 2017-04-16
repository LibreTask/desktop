/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import { routerReducer as routing } from 'react-router-redux'

import sideMenu from './ui/sidemenu'
import navbar from './ui/navbar'
import logindialog from './ui/logindialog'
import logoutdialog from './ui/logoutdialog'
import taskview from './ui/taskview'

import userReducer from './user'
import tasksReducer from './entities/tasks'

import syncReducer from './sync'

const uiReducer = combineReducers({
  logindialog,
  logoutdialog,
  sideMenu,
  navbar,
  taskview
})

const entitiesReducer = combineReducers({
  tasks: tasksReducer,
})

const appReducer = combineReducers({
  ui: uiReducer,
  entities: entitiesReducer,
  user: userReducer,
  sync: syncReducer,
  routing
})

const rootReducer = (state, action) => {
  if (action.type === 'RESET') {
    state = undefined;
  }

  return appReducer(state, action)
}

export default rootReducer
