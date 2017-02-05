/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export function setRightNavButton(rightButtonLocation, transitionLocation) {
  return {
    type: 'SET_RIGHT_NAV_BUTTON',
    rightButton: rightButtonLocation,
    transitionLocation: transitionLocation
    /* TODO - expand this functionality
    rightButton: {
      onClickFunc: onClickFunc,
      onClickArgs: onClickArgs,
      buttonIcon: buttonIcon
    }
    */
  }
}

export function removeRightNavButton() {
  return {
    type: 'REMOVE_RIGHT_NAV_BUTTON',
    rightButton: null
  }
}

export function setNavbarTitle(title) {
  return {
    type: 'SET_NAVBAR_TITLE',
    title: title
  }
}
