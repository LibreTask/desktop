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

      // sync all new updates
      return TaskController.syncTasks(lastSuccessfulSyncDateTimeUtc)
      .then( response => {

        let syncAction = {
          type: SYNC_TASKS,
          tasks: response.tasks,

          // set 'lastSync' time as five minutes ago, to provide small buffer
          lastSuccessfulSyncDateTimeUtc: DateUtils.fiveMinutesAgo()
        }

        // After the Sync, let the reducer handle what Tasks to
        // update/create/delete. Here are are simply passing all
        // the sync data to the Reducer, without performing any
        // logic on it.
        dispatch(syncAction)
      })
      .catch( error => {
        console.log('sync error....')
        console.dir(error)
      })
    }
  }
}

/******************************************************************************/

/*
Invoked when a task create/update/delete could not reach the server.
Mark it as "pending" and wait until the next available submission opportunity.
*/
export const PENDING_TASK_CREATE = 'PENDING_TASK_CREATE'
export const PENDING_TASK_UPDATE = 'PENDING_TASK_UPDATE'
export const PENDING_TASK_DELETE = 'PENDING_TASK_DELETE'

export const pendingTaskCreate = (task) => {
 return {
   type: PENDING_TASK_CREATE,
   task: task,
 }
}

export const pendingTaskUpdate = (task) => {
 return {
   type: PENDING_TASK_UPDATE,
   tasks: tasks
 }
}

export const pendingTaskDelete = (task) => {
 return {
   type: PENDING_TASK_DELETE,
   task: task
 }
}

/******************************************************************************/
