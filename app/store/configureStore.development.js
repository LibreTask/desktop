/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import { hashHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import rootReducer from '../reducers'

const router = routerMiddleware(hashHistory)
const logger = createLogger()
const enhancer = applyMiddleware(thunk, logger, router)

export default function configureStore(initialState) {
  return createStore(rootReducer, initialState, enhancer)
}
