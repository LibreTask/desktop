/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

export const COLLAPSE_CATEGORY = 'COLLAPSE_CATEGORY'
export const SHOW_CATEGORY = 'SHOW_CATEGORY'
export const TOGGLE_CATEGORY = 'TOGGLE_CATEGORY'

export const TOGGLE_SHOW_COMPLETED_TASKS = 'TOGGLE_SHOW_COMPLETED_TASKS'

export const REFRESH_TASK_VIEW = 'REFRESH_TASK_VIEW'
export const STOP_REFRESH_TASK_VIEW = 'END_REFRESH_TASK_VIEW'

export const TODAYS_TASKS = 'TODAYS_TASKS'
export const TOMORROWS_TASKS = 'TOMORROWS_TASKS'
export const FUTURE_TASKS = 'FUTURE_TASKS'
export const OVERDUE_TASKS = 'OVERDUE_TASKS'
export const TASKS_WITH_NO_DATE = 'TASKS_WITH_NO_DATE'

import TaskUtils from '../../utils/task-utils'

export const refreshCollapseStatusAfterTaskDelete = (task) => {

  return function(dispatch, getState) {

    const tasks = getState().entities.task.tasks

    /*
    if deleted and one other COLLAPSED task remains
	   - uncollapse it
     */
  }
}

export const refreshCollapseStatusAfterTaskUpdate = (task) => {

  return function(dispatch, getState) {

    const tasks = getState().entities.task.tasks

    /*
    if updated and now all tasks are collapsed
	     - uncollapse one
     */
  }
}

/*
  If no tasks exist, we want the newly created task to not have its view
  initially collapsed. After creating a task, the first action a user will
  take would be to un-collapse the task's view category. We are simply saving
  them that step here.
*//*
export const refreshCollapseStatusAfterTaskCreate = (task) => {

  return function(dispatch, getState) {

    const tasks = getState().entities.task.tasks

    // TODO - fix the hacky date logic in this method

    const taskDate = task.dueDateTimeUtc
      ? new Date(task.dueDateTimeUtc)
      : null;

    if (_noTasksAreCurrentlyDisplayed(tasks, showCompletedTasks)()) {

      if (!taskDate) {
        if (this._viewIsCollapsed(TaskViewActions.TASKS_WITH_NO_DATE)) {

          this.props.toggleTaskView(TaskViewActions.TASKS_WITH_NO_DATE)
        }
      } else {

        const today = new Date()
        const tomorrow = new Date(today.getFullYear(),
          today.getMonth(), today.getDate() + 1)

        if (taskDate.toDateString() === today.toDateString()
          && this._viewIsCollapsed(TaskViewActions.TODAYS_TASKS)) {

          this.props.toggleTaskView(TaskViewActions.TODAYS_TASKS)
        }
        else if (taskDate.toDateString() === tomorrow.toDateString()
          && this._viewIsCollapsed(TaskViewActions.TOMORROWS_TASKS)) {

          this.props.toggleTaskView(TaskViewActions.TOMORROWS_TASKS)
        }
        else if (taskDate.getTime() > tomorrow.getTime()
          && this._viewIsCollapsed(TaskViewActions.FUTURE_TASKS)) {

          this.props.toggleTaskView(TaskViewActions.FUTURE_TASKS)
        }
        else if (taskDate.getTime() < today.getTime()
          && this._viewIsCollapsed(TaskViewActions.OVERDUE_TASKS)) {

          this.props.toggleTaskView(TaskViewActions.OVERDUE_TASKS)
        }
        else {
          // TODO - what here?
        }
      }
    }

    /*
    if created and new task is collapsed
	     - uncollapse it
     */
/*  }
}

_noTasksAreCurrentlyDisplayed = (tasks, showCompletedTasks) => {
  if (tasks && Object.keys(tasks).length) {
    for (let taskId in tasks) {
      if (TaskUtils.shouldRenderTask(ttasks[taskId], showCompletedTasks)) {

          return false; // at least one task is displayed
      }
    }
  }

  return true; // no tasks are displayed
}
*/

/*
  This is primarily intended to be used to refresh
  the TaskView each day at midnight.
*/
export const refreshTaskView = (shouldRefresh) => {
  return {
    type: REFRESH_TASK_VIEW,
    shouldRefreshTaskView: shouldRefresh,
    refreshDate: (new Date()).getDate() // TODO - refine
  }
}

export const stopTaskViewRefresh = () => {
  return {
    type: STOP_REFRESH_TASK_VIEW
  }
}

export const toggleShowCompletedTasks = () => {
  return {
    type: TOGGLE_SHOW_COMPLETED_TASKS
  }
}

export const collapseCategory = (category) => {
  return alterCategory(COLLAPSE_CATEGORY, category)
}

export const showCategory = (category) => {
  return alterCategory(SHOW_CATEGORY, category)
}

export const toggleCategory = (category) => {
  return alterCategory(TOGGLE_CATEGORY, category)
}

/*
  This is intended to store the users preferences, so they do not have to
  continually collapse certain categories.
*/
const alterCategory = (type, category) => {
  return {
    type: type,
    category: category
  }
}
