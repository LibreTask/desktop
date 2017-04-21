/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_TASK = 'CREATE_OR_UPDATE_TASK'

export const createOrUpdateTask = (task) => {
  return {
    type: CREATE_OR_UPDATE_TASK,
    task: task,
  }
}

export const CREATE_OR_UPDATE_TASKS = 'CREATE_OR_UPDATE_TASKS'

export const createOrUpdateTasks = (tasks) => {
  return {
    type: CREATE_OR_UPDATE_TASKS,
    tasks: tasks
  }
}

export const DELETE_TASK = 'DELETE_TASK'

export const deleteTask = (taskId) => {
  return {
    type: DELETE_TASK,
    taskId: taskId
  }
}

export const DELETE_ALL_TASKS = 'DELETE_ALL_TASKS'

export const deleteAllTasks = () => {
  return {
    type: DELETE_ALL_TASKS
  }
}

export const START_TASK_SYNC = 'START_TASK_SYNC'

export const startTaskSync = (intervalId) => {

  return {
    type: START_TASK_SYNC,
    intervalId: intervalId
  }
}

export const END_TASK_SYNC = 'END_TASK_SYNC'

export const endTaskSync = () => {

  return {
    type: END_TASK_SYNC,
  }
}

import * as TaskController from '../../models/controllers/task'
import * as UserController from '../../models/controllers/user'
import DateUtils from '../../utils/date-utils'

export const SYNC_TASKS = 'SYNC_TASKS'

export const syncTasks = () => {

  return function(dispatch, getState) {

    console.log('sync task state...')
    console.dir(getState())

    let profile = getState().entities.user.profile

    // only sync if the user can access the network
    if (UserController.canAccessNetwork(profile)) {

      // if no successful sync has been recorded, sync entire last month
      let lastSuccessfulSyncDateTimeUtc =
        getState().entities.task.lastSuccessfulSyncDateTimeUtc
        || DateUtils.lastMonth() // TODO - refine approach

      let currentSyncDateTimeUtc = new Date() // TODO - refine

      // sync all new updates
      return TaskController.syncTasks(lastSuccessfulSyncDateTimeUtc)
      .then( response => {

        let syncAction = {
          type: SYNC_TASKS,
          tasks: response.tasks,
          lastSuccessfulSyncDateTimeUtc: currentSyncDateTimeUtc
        }

        dispatch(syncAction)
      })
      .catch( error => {
        console.log('sync error....')
        console.dir(error)
      })
    }
  }
}
