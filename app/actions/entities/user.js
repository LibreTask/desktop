/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_PROFILE = 'CREATE_OR_UPDATE_PROFILE'

export const createOrUpdateProfile = (profile) => {
  return {
    type: CREATE_OR_UPDATE_PROFILE,
    profile: profile,
    isLoggedIn: true
  }
}

export const DELETE_PROFILE = 'DELETE_PROFILE'

export const deleteProfile = () => {
  return {
    type: DELETE_PROFILE
  }
}

export const START_USER_SYNC = 'START_USER_SYNC'

export const startUserSync = (intervalId) => {

  return {
    type: START_USER_SYNC,
    intervalId: intervalId
  }
}

export const END_USER_SYNC = 'END_USER_SYNC'

export const endUserSync = () => {

  return {
    type: END_USER_SYNC,
  }
}

import * as UserController from '../../models/controllers/user'

export const SYNC_USER = 'SYNC_USER'

export const syncUser = () => {

  return function(dispatch) {

    // TODO - only sync if logged in

    UserController.syncUser()
    .then( response => {

      if (response.profile) {
        let syncAction = {
          type: SYNC_USER,
          profile: response.profile
        }

        dispatch(syncAction)
      }
    })
    .catch( error => {
      console.log('sync profile error....')
      console.dir(error)
    })
  }
}
