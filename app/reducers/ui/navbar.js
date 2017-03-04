/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import AppConstants from '../../constants'

const initialState = {

  farRightButton: null,
  farRightTransitionLocation: null,

  mediumRightButton: null,
  mediumRightTransitionLocation: null,

  leftButton: null,
  leftTransitionLocation: null,

  title: AppConstants.APP_NAME
  /*** No right button initially ***
  rightButton: {
    buttonIcon: 'pencil-square-o',
    onClickFunc: 'example', // a key that maps to actual function
    onClickArgs: {
      // ...
    }
  }
  */
}

export default function navbarReducer(state = initialState, action) {

  switch (action.type) {
    case 'SET_MEDIUM_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        mediumRightButton: action.mediumRightButton,
        mediumRightTransitionLocation: action.mediumRightTransitionLocation
        /*

        TODO - expand to this functionality

        // we expand the action, rather than directly
        // assign rightButton, for improved clarity
        rightButton: {
          onClickFunc: action.rightButton.onClickFunc,
          onClickArgs: action.rightButton.onClickArgs,
          buttonIcon: action.rightButton.buttonIcon
        }
        */
      })
    case 'REMOVE_MEDIUM_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        mediumRightButton: null
      })
    case 'SET_FAR_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        farRightButton: action.farRightButton,
        farRightTransitionLocation: action.farRightTransitionLocation
      })
    case 'REMOVE_FAR_RIGHT_NAV_BUTTON':
      return Object.assign({}, state, {
        farRightButton: null
      })
    case 'SET_LEFT_NAV_BUTTON':
      return Object.assign({}, state, {
        leftButton: action.leftButton,
        transitionLocation: action.transitionLocation
      })
    case 'REMOVE_LEFT_NAV_BUTTON':
      return Object.assign({}, state, {
        leftButton: null
      })
    case 'SET_NAVBAR_TITLE':
      return Object.assign({}, state, {
        title: action.title
      })
    default:
      return state
  }
}
