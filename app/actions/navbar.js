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
    leftTransitionLocation: transitionLocation
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

export function setMediumRightNavButton(rightButtonLocation,
  transitionLocation = undefined) {

  return {
    type: 'SET_MEDIUM_RIGHT_NAV_BUTTON',
    mediumRightButton: rightButtonLocation,
    mediumRightTransitionLocation: transitionLocation
    /* TODO - expand this functionality
    rightButton: {
      onClickFunc: onClickFunc,
      onClickArgs: onClickArgs,
      buttonIcon: buttonIcon
    }
    */
  }
}

export function removeMediumRightNavButton() {
  return {
    type: 'REMOVE_MEDIUM_RIGHT_NAV_BUTTON',
    mediumRightButton: null
  }
}

/*
The default right navigation bar button is intended to be the 'far right' nav
button. If a secondary button is required, then use the 'medium right' button.
*/
export function setFarRightNavButton(rightButtonLocation,
  transitionLocation = undefined) {

  return {
    type: 'SET_FAR_RIGHT_NAV_BUTTON',
    farRightButton: rightButtonLocation,
    farRightTransitionLocation: transitionLocation
    /* TODO - expand this functionality
    rightButton: {
      onClickFunc: onClickFunc,
      onClickArgs: onClickArgs,
      buttonIcon: buttonIcon
    }
    */
  }
}

export function removeFarRightNavButton() {
  return {
    type: 'REMOVE_FAR_RIGHT_NAV_BUTTON',
    farRightButton: null
  }
}

export function setNavbarTitle(title) {
  return {
    type: 'SET_NAVBAR_TITLE',
    title: title
  }
}
