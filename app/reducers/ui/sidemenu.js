/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import {
  SIDEMENU_TOGGLE,
  SIDEMENU_OPEN,
  SIDEMENU_CLOSE
} from "../../actions/ui/sidemenu";

const initialState = {
  isOpen: false,
  disableGestures: false
};

export default function sideMenuReducer(state = initialState, action) {
  switch (action.type) {
    case SIDEMENU_TOGGLE:
      return {
        ...state,
        isOpen: !state.isOpen
      };
    case SIDEMENU_OPEN:
      return {
        ...state,
        isOpen: true
      };
    case SIDEMENU_CLOSE:
      return {
        ...state,
        isOpen: false
      };
    default:
      return state;
  }
}
