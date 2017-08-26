/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from "redux";
import {
  CREATE_OR_UPDATE_PROFILE,
  DELETE_PROFILE,
  START_USER_SYNC,
  END_USER_SYNC,
  SYNC_USER,
  ADD_PENDING_PROFILE_UPDATE,
  REMOVE_PENDING_PROFILE_UPDATE,
  START_QUEUED_PROFILE_SUBMIT,
  STOP_QUEUED_PROFILE_SUBMIT
} from "../../actions/entities/user";
import { updateObject } from "./../reducer-utils";

import * as ProfileStorage from "../../models/storage/profile-storage";

function startUserSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    intervalId: action.intervalId
  });
}

function endUserSync(state, action) {
  //  clearInterval(state.intervalId); // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    intervalId: undefined
  });
}

function deleteProfile(state, action) {
  ProfileStorage.deleteProfile();

  return updateObject(state, {
    profile: {},
    isLoggedIn: false
  }); // on delete profile, wipe everything
}

function addProfile(state, action) {
  ProfileStorage.createOrUpdateProfile(action.profile);

  return updateObject(state, {
    profile: action.profile,
    isLoggedIn: action.isLoggedIn
  });
}

/*
   Always update lastSuccessfulSyncDateTimeUtc, because it is assumed that
   this reducer is ONLY invoked after a successful sync.
 */
function syncUser(state, action) {
  let queuedProfile = state.queuedProfile;
  let syncedProfile = action.profile;

  let updatedState = updateObject(state, {
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  });

  if (
    queuedProfile &&
    new Date(queuedProfile.updatedAtDateTimeUtc) >
      new Date(syncedProfile.updatedAtDateTimeUtc)
  ) {
    // do not update the local profile, if we have
    // a more up-to-date profile already queued
    return updatedState;
  } else {
    // if an update to profile is available, update, otherwise, ignore
    if (action.profile) {
      ProfileStorage.createOrUpdateProfile(action.profile);

      return updateObject(updatedState, { profile: action.profile });
    } else {
      return updateState;
    }
  }
}

function addPendingProfileUpdate(state, action) {
  ProfileStorage.queueProfileUpdate(action.queuedProfile);

  return updateObject(state, {
    queuedProfile: action.queuedProfile
  });
}

function removePendingProfileUpdate(state, action) {
  ProfileStorage.deletedQueuedProfile();

  return updateObject(state, {
    queuedProfile: undefined
  });
}

function startQueuedProfileSubmission(state, action) {
  return updateObject(state, {
    isSubmittingQueuedProfileUpdates: true,
    queuedProfileSubmitIntervalId: action.intervalId
  });
}

function stopQueuedProfileSubmission(state, action) {
  return updateObject(state, {
    isSubmittingQueuedProfileUpdates: false,
    queuedProfileSubmitIntervalId: undefined
  });
}

const initialState = {
  profile: {},
  queuedProfile: undefined,
  isLoggedIn: false,
  isSubmittingQueuedProfileUpdates: false,
  queuedProfileSubmitIntervalId: undefined,
  isSyncing: false,
  lastSuccessfulSyncDateTimeUtc: undefined,
  intervalId: undefined // used to cancel sync
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    /*
       TODO - doc
     */
    case START_USER_SYNC:
      return startUserSync(state, action);
    /*
       TODO - doc
     */
    case END_USER_SYNC:
      return endUserSync(state, action);
    /*
      TODO - doc
     */
    case SYNC_USER:
      return syncUser(state, action);
    /*
       TODO - doc
     */
    case CREATE_OR_UPDATE_PROFILE:
      return addProfile(state, action);
    /*
       TODO - doc
     */
    case DELETE_PROFILE:
      return deleteProfile(state, action);
    /*
       TODO - doc
     */
    case ADD_PENDING_PROFILE_UPDATE:
      return addPendingProfileUpdate(state, action);
    /*
       TODO - doc
     */
    case REMOVE_PENDING_PROFILE_UPDATE:
      return removePendingProfileUpdate(state, action);
    /*
       TODO - doc
     */
    case START_QUEUED_PROFILE_SUBMIT:
      return startQueuedProfileSubmission(state, action);
    /*
       TODO - doc
     */
    case STOP_QUEUED_PROFILE_SUBMIT:
      return stopQueuedProfileSubmission(state, action);

    default:
      return state;
  }
}

export default userReducer;
