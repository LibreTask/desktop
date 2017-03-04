/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

/*
 When rightButtonLocation === AppConstants.BACK_NAVBAR_BUTTON, then a
 transitionLocation is not used, because we simply hashHistory.goBack()
*/
export function setLeftNavButton(leftButtonLocation,
  transitionLocation = undefined) {

  return {
    type: 'SET_LEFT_NAV_BUTTON',
    leftButton: leftButtonLocation,
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

export function removeLeftNavButton() {
  return {
    type: 'REMOVE_LEFT_NAV_BUTTON',
    leftButton: null
  }
}

export function setRightNavButton(rightButtonLocation,
  transitionLocation = undefined) {

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
