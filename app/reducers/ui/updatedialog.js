/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

const initialState = {
  isOpen: false,
  updateAlreadyShown: false
};

export default function UPDATEDIALOGReducer(state = initialState, action) {
  switch (action.type) {
    case "UPDATEDIALOG_SHOWN":
      return {
        ...state,
        updateAlreadyShown: true
      };
    case "UPDATEDIALOG_TOGGLE":
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case "UPDATEDIALOG_OPEN":
      return {
        ...state,
        isOpen: true
      };
    case "UPDATEDIALOG_CLOSE":
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}
