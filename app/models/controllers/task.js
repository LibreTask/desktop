/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from '../../middleware/api'

const uuid = require('node-uuid')

/*
  Only invoked when a Task need to be created client side, rather than server
  side. That is, when the client 1) has no network connection OR 2) is not
  logged in.
*/
export const constructTaskLocally = (taskName, taskNotes,
  taskDueDateTimeUtc) => {
  return {
    name: taskName,
    notes: taskNotes,
    dueDateTimeUtc: taskDueDateTimeUtc,
    id: 'client-task-' + uuid.v4(),
    // Notably, no userId is assigned because one may not exist.
    // A successful sync will rectify any discrepencies.
  }
}

export const createTask = (taskName, taskNotes, taskDueDateTimeUtc,
   userId, password) => {
  const request = {
    endpoint: `task/create`,
    method: 'POST',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       name: taskName,
       notes: taskNotes,
       dueDateTimeUtc: taskDueDateTimeUtc,
       // TODO -
     })
  }

  return invoke(request)
}

export const updateTask = (task, userId, password) => {
    const request = {
      endpoint: `task/update`,
      method: 'POST',
       headers: {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': constructAuthHeader(userId, password)
       },
       body: JSON.stringify({
         task: task
       })
    }

    return invoke(request)
}

export const deleteTask = (taskId, userId, password) => {
  const request = {
    endpoint: `task/delete`,
    method: 'DELETE',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     },
     body: JSON.stringify({
       taskId: taskId
     })
  }

  return invoke(request)
}

export const fetchTask = (taskId, userId, password) => {
  const request = {
      endpoint: `task/get-task-by-id/taskId=${taskId}`,
      schema: TaskSchema,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': constructAuthHeader(userId, password)
      },
  }

  return invoke(request)
}

import * as TaskStorage from '../storage/task-storage'
import * as ProfileStorage from '../storage/profile-storage'

// TODO - move this method to general-purpose file
async function getState() {

  let tasks = []
  let profile = undefined
  let isLoggedIn = false

  try {
    tasks = await TaskStorage.getAllTasks()
  } catch (err) { /* ignore */ }


  try {
    profile = await ProfileStorage.getMyProfile()
  } catch (err) { /* ignore */ }

  try {
    isLoggedIn = await ProfileStorage.isLoggedIn()
  } catch (err) { /* ignore */ }

  return {
    user: {
      profile: profile,
      isLoggedIn: isLoggedIn
    },
    tasks: tasks
  }
}

export const syncTasks = async () => {

  const state = await getState()

  console.log("state...")
  console.dir(state)

  if (!state.user.isLoggedIn) {
    return;
  }

  const userId = state.user.profile.id
  const password = state.user.profile.password

  // TODO - pass in (and store) the actual date

  const request = {
    endpoint: 'task/sync-tasks-after-timestamp/timestamp=2017-04-20',
    method: 'GET',
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       'Authorization': constructAuthHeader(userId, password)
     }
  }

  console.log('request...')
  console.dir(request)

  return invoke(request)
  .then( response => {

    // TODO - log / inspect object / persist if necessary

    console.log("abc response...")
    console.dir(response)

    if (response.state.entities.tasks
        && response.state.entities.tasks.length > 0) {
      TaskStorage.createOrUpdateTasks(response.state.entities.tasks)
    }

    console.log('after profile update storage...')

    /**
     * The response should contain a list attribute
     */
    return response
  })
  .catch(err => {
    console.log("task err...")
    console.dir(err)
  })
}
