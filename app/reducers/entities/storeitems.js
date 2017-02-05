/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {

} from '../../actions/entities/store'
import {
  updateObject,
  createReducer,
  constructHashFromId
} from '../reducer-utils'

const initialState = {
  storeItems: {},
};

function storeItemsReducer(state = initialState, action) {
  return state;
}

export default storeItemsReducer;
