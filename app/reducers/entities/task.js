/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { combineReducers } from 'redux'
import {
  PENDING_TASK_CREATE,
  PENDING_TASK_UPDATE,
  PENDING_TASK_DELETE,
  CREATE_OR_UPDATE_TASK,
  CREATE_OR_UPDATE_TASKS,
  DELETE_ALL_TASKS,
  DELETE_TASK,
  START_TASK_SYNC,
  END_TASK_SYNC,
  SYNC_TASKS
} from '../../actions/entities/task'
import {
  updateObject,
  createReducer,
} from '../reducer-utils'

import * as _ from 'lodash'

function removeTask(tasks, taskId) {
  let remainingTasks = _.filter(tasks, function(task) {
    return task.id !== taskId // filter out taskId
  })

  return remainingTasks
}

function pendingTaskCreate(state, action) {
  let newTaskEntry = {}
  newTaskEntry[action.task.id] = action.task

  let updatedPendingTaskActions = updateObject(state.pendingTaskActions, {
    create: newTaskEntry
  })

  return updateObject(state, updatedPendingTaskActions)
}

function pendingTaskUpdate(state, action) {

  return state // TODO
}

function pendingTaskDelete(state, action) {

  return state // TODO
}

function startTaskSync(state, action) {
  return updateObject(state, {
    isSyncing: true,
    intervalId: action.intervalId
  })
}

function endTaskSync(state, action) {
  clearInterval(state.intervalId) // TODO - is this the best place to do it?

  return updateObject(state, {
    isSyncing: false,
    intervalId: undefined
  })
}

function deleteAllTasks(state, action) {
  return updateObject(state, {
    tasks: { /* all tasks are deleted */ }
  })
}

function deleteTask(state, action) {
  let remainingTasks = removeTask(state.tasks, action.taskId)

  let taskMap = {}
  _.forEach(remainingTasks, (task) => {
    taskMap[task.id] = task
  })

  return updateObject(state, { tasks: taskMap })
}

function addTasks(state, action) {
  let normalizedTasks = {}
  _.forEach(action.tasks, (task) => {
    normalizedTasks[task.id] = task
  })
  return updateObject(state,
    {
      tasks: updateObject(state.tasks, normalizedTasks),
    }
  )
}

function addTask(state, action) {
  return addNormalizedTask(state, action.task)
}

function addNormalizedTask(state, normalizedTask) {

  let updatedTaskEntry = {}
  updatedTaskEntry[normalizedTask.id] = normalizedTask

  return updateObject(state,
    {
      tasks: updateObject(state.tasks, updatedTaskEntry)
    }
  )
}

/*
  Always update lastSuccessfulSyncDateTimeUtc, because it is assumed that
  this reducer is ONLY invoked after a successful sync.
*/
function syncTasks(state, action) {

  const syncedTasks = action.tasks
  const existingTasks = state.tasks

  console.log("synced tasks...")
  console.dir(syncedTasks)

  console.log("existing tasks...")
  console.dir(existingTasks)

  let tasksToCreateOrUpdate = []

  _.forEach(syncedTasks, (syncedTask) => {

    if (syncedTask.id in existingTasks) {

      const syncedTaskUpdateDateTimeUtc = syncedTask.updatedAtDateTimeUtc
      const existingTaskUpdateDateTimeUtc =
        existingTasks[syncedTask.id].updatedAtDateTimeUtc

        console.log("task id: " + syncedTask.id)

        console.log("synced update: " + syncedTaskUpdateDateTimeUtc)
        console.log("existing update: " + existingTaskUpdateDateTimeUtc)

      console.log("equality: " + (syncedTaskUpdateDateTimeUtc > existingTaskUpdateDateTimeUtc))

      if (syncedTaskUpdateDateTimeUtc > existingTaskUpdateDateTimeUtc) {
        // synced task was updated more recently than the version on
        // this device. so we must mark it for update/creation.
        tasksToCreateOrUpdate.push(syncedTask)
      } else {
        // the version of the task on the client is the most up-to-date.
        // we sent it to the server.

        // TODO - handle this case, should we queue up?
      }

    } else {
      // synced task does not already exist on this device.
      // so we must mark it for update/creation.
      tasksToCreateOrUpdate.push(syncedTask)
    }
  })

  console.log("tasks to create or update...")
  console.dir(tasksToCreateOrUpdate)

  return addTasks(state, {
    tasks: tasksToCreateOrUpdate,
    lastSuccessfulSyncDateTimeUtc: action.lastSuccessfulSyncDateTimeUtc
  })
}

const initialState = {
  tasks: {
    // taskId: {public task attributes}
  },
  pendingTaskActions: {
    update: {
      // taskId: {public task attributes}
    },
    delete: {
      // taskId: {public task attributes}
    },
    create: {
      // taskId: {public task attributes}
    }
  },
  isSyncing: false,
  intervalId: undefined, // used to cancel sync
  lastSuccessfulSyncDateTimeUtc: undefined
}

function tasksReducer(state = initialState, action) {
  switch(action.type) {

    /*
      TODO - doc
    */
    case START_TASK_SYNC:
      return startTaskSync(state, action)

    /*
      TODO - doc
    */
    case END_TASK_SYNC:
      return endTaskSync(state, action)

    /*
     TODO - doc
    */
    case SYNC_TASKS:
      return syncTasks(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASK:
      return addTask(state, action)

    /*
      TODO - doc
    */
    case CREATE_OR_UPDATE_TASKS:
      return addTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_ALL_TASKS:
      return deleteAllTasks(state, action)

    /*
      TODO - doc
    */
    case DELETE_TASK:
      return deleteTask(state, action)

    /*
      TODO - doc
    */
    case PENDING_TASK_DELETE:
      return pendingTaskDelete(state, action)

    /*
      TODO - doc
    */
    case PENDING_TASK_UPDATE:
      return pendingTaskUpdate(state, action)

    /*
      TODO - doc
    */
    case PENDING_TASK_CREATE:
      return pendingTaskCreate(state, action)

    default:
      return state
  }
}

export default tasksReducer
