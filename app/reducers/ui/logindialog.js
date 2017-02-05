/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

const initialState = {
  isOpen: false,
}

export default function loginDialogReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGINDIALOG_TOGGLE':
      return {
        ...state,
        isOpen: !state.isOpen
      }
    case 'LOGINDIALOG_OPEN':
      return {
        ...state,
        isOpen: true
      }
    case 'LOGINDIALOG_CLOSE':
      return {
        ...state,
        isOpen: false
      }
    default:
      return state
  }
}
