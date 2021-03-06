/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

const initialState = {
  isOpen: false
};

export default function logoutDialogReducer(state = initialState, action) {
  switch (action.type) {
    case "LOGOUTDIALOG_TOGGLE":
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case "LOGOUTDIALOG_OPEN":
      return {
        ...state,
        isOpen: true
      };
    case "LOGOUTDIALOG_CLOSE":
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}
