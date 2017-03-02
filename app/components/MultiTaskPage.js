/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {deepOrange500} from 'material-ui/styles/colors'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {List, ListItem} from 'material-ui/List'
import Checkbox from 'material-ui/Checkbox'

const FaChevronRight = require('react-icons/lib/fa/chevron-right')
const FaChevronDown = require('react-icons/lib/fa/chevron-down')

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'

import DateUtils from '../utils/date-utils'
import AppConstants from '../constants'
import AppStyles from '../styles'

const styles = {
  footer: {
    textAlign: 'center',
    fontSize: '100%',
    color: AppStyles.linkColor
  },
  listItem: {
    color: 'black',
    fontSize: '100%'
  },
  listItemHeader: {
    color: 'black',
    fontSize: '110%',
    fontWeight: 'bold'
  },
  completedTask: {
    opacity: 0.3,
    // TODO - strike through the task when completed
  },
  emptyListText: {
    margin: 30,
    fontSize: '140%'
  }
}

// TODO - look into alternate themes
const muiTheme = getMuiTheme({
  palette: {
    accent1Color: deepOrange500,
  },
})

class MultiTaskPage extends Component {

  constructor(props) {
    super(props)

    let millis = new Date()
    millis = millis.getTime()

    // initial state
    this.state = {
      willFocusSubscription: null,
      isRefreshing: false,
      todaysTasksCollapsed: false, // TODO only initially display todays
      tomorrowsTasksCollapsed: false,
      futureTasksCollapsed: false,
      overdueTasksCollapsed: false,
      tasksWithNoDateCollapsed: false,
    }
  }

  componentDidMount() {
    this._setRightNavButtonIfNecessary()
    this.props.setNavbarTitle(this._getHeaderName())
  }

  componentWillUnmount() {
    this.props.removeRightNavButton()
  }

  componentWillReceiveProps(nextProps) {
    // updated props could mean a new header name; so we set it here
    this.props.setNavbarTitle(this._getHeaderName())
    this._setRightNavButtonIfNecessary()
  }

  _setRightNavButtonIfNecessary() {
    let listId = this._getListId()

    // only display edit list when an actual list has been selected
    if (listId !== AppConstants.ALL_TASKS_IDENTIFIER) {
      let transitionLocation = `/list/${listId}/edit`

      this.props.setRightNavButton(AppConstants.LIST_EDIT_NAVBAR_BUTTON,
         transitionLocation)
    } else {
      this.props.removeRightNavButton()
    }
  }

  _getListId()  {

    return (this.props.router.params && this.props.router.params.listId)
      ? this.props.router.params.listId
      : AppConstants.ALL_TASKS_IDENTIFIER;
  }

  _getHeaderName() {
    let myListId = this._getListId()

    if (myListId === AppConstants.ALL_TASKS_IDENTIFIER) {
      return "All Tasks"
    } else {
      for (let listId in this.props.lists) {
        if (myListId === listId) {
          return this.props.lists[myListId].name
        }
      }
    }

    return "Error!" // TODO - fix this case
  }

  _sortTasksByDateAndInsertHeaders(tasks)  {

    // TODO - fix the hacky date logic in this method

    const today = new Date()
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    let todaysTasks = []
    let tomorrowsTasks = []
    let futureTasks = []
    let overdueTasks = []
    let tasksWithNoDate = []

    for (let task of tasks) {

      const taskDate = task.dueDateTimeUtc
        ? new Date(task.dueDateTimeUtc)
        : null;

      if (!taskDate) {
        task.displayCategory = 'No Date'
        tasksWithNoDate.push(task)
      } else if (taskDate.toDateString() === today.toDateString()) {
        task.displayCategory = 'Today'
        todaysTasks.push(task)
      } else if (taskDate.toDateString() == tomorrow.toDateString()) {
        task.displayCategory = 'Tomorrow'
        tomorrowsTasks.push(task)
      } else if (taskDate.getTime() > tomorrow.getTime()) {
        task.displayCategory = 'Future'
        futureTasks.push(task)
      } else if (taskDate.getTime() < today.getTime()) {
        task.displayCategory = "Overdue"
        overdueTasks.push(task)
      } else {
        // TODO - what here?
      }
    }

    if (tasksWithNoDate.length > 0) {
      tasksWithNoDate.unshift({
        isHeader: true,
        name: 'No Date',
      })
    }

    if (todaysTasks.length > 0) {
      todaysTasks.unshift({
        isHeader: true,
        name: 'Today',
      })
    }

    if (tomorrowsTasks.length > 0) {
      tomorrowsTasks.unshift({
        isHeader: true,
        name: 'Tomorrow',
      })
    }

    if (futureTasks.length > 0) {
      futureTasks.unshift({
        isHeader: true,
        name: 'Future',
      })
    }

    if (overdueTasks.length > 0) {
      overdueTasks.unshift({
        isHeader: true,
        name: 'Overdue',
      })
    }

    return tasksWithNoDate.concat(
      todaysTasks, tomorrowsTasks, futureTasks, overdueTasks)
  }

  _shouldRenderTask(task) {

    // TODO - hide if older than today and already completed


    if (task.displayCategory === 'No Date'
          && this.state.tasksWithNoDateCollapsed) {
      return false
    }

    if (task.displayCategory === 'Today'
          && this.state.todaysTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Tomorrow'
          && this.state.tomorrowsTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Future'
          && this.state.futureTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Overdue'
          && this.state.overdueTasksCollapsed) {
      return false
    }

    return true
  }

  _isHeaderCurrentlyCollapsed(header) {
    if (header.name === 'No Date') {
      return this.state.tasksWithNoDateCollapsed
    } else if (header.name === 'Today') {
      return this.state.todaysTasksCollapsed
    } else if (header.name === 'Tomorrow') {
      return this.state.tomorrowsTasksCollapsed
    } else if (header.name === 'Future') {
      return this.state.futureTasksCollapsed
    } else if (header.name === 'Overdue') {
      return this.state.overdueTasksCollapsed
    } else {
      return false // TODO - what here?
    }
  }

  _renderRow(row)  {
    try {
      return row.isHeader
        ? this._renderHeader(row)
        : this._renderTask(row)
    } catch (err) {
      console.log('err rendering row: ' + err)
    }
  }

  _renderTask(task) {

    if (this._shouldRenderTask(task)) {

      let listItemStyle =
        task.isCompleted
        ? {...styles.listItem, ...styles.completedTask}
        : styles.listItem

      return (
        <ListItem
          style={listItemStyle}
          key={`task-list-item-${task.id}`}
          leftCheckbox={
            <Checkbox
              checked={task.isCompleted}
              onClick={(event) => {

              /*
                We must use `onClick`, rather than `onCheck`, so that we can
                stop event propagation. That means we do not have access to
                the checked status, so we simply invert the task's current
                completion status.
              */
              task.isCompleted = !task.isCompleted

              TaskStorage.createOrUpdateTask(task)
              this.props.createOrUpdateTask(task)

              event.stopPropagation()
            }}/>
          }
          onClick={
            (event) => {
              this.props.removeRightNavButton() // remove before transition
              hashHistory.push(`/task/${task.id}`)
            }
          }
          primaryText={task.name}
        />
      )
    }

    return <div key={`empty-task-list-item-${task.id}`}></div>
  }

  _renderHeader(header) {

    let listsArrowImage =
        this._isHeaderCurrentlyCollapsed(header)
        ? <FaChevronRight/>
        : <FaChevronDown/>;

    return  (
       <ListItem
        style={styles.listItemHeader}
        key={`list-item-header-${header.name}`}
        leftIcon={listsArrowImage}
        primaryText={header.name}
        onTouchTap={ () => {
          let stateUpdate = {}

          if (header.name === 'No Date') {
            stateUpdate = {
              tasksWithNoDateCollapsed: !this.state.tasksWithNoDateCollapsed
            }
          } else if (header.name === 'Today') {
            stateUpdate = {
              todaysTasksCollapsed: !this.state.todaysTasksCollapsed
            }
          } else if (header.name === 'Tomorrow') {
            stateUpdate = {
              tomorrowsTasksCollapsed: !this.state.tomorrowsTasksCollapsed
            }
          } else if (header.name === 'Future') {
            stateUpdate = {
              futureTasksCollapsed: !this.state.futureTasksCollapsed
            }
          } else if (header.name === 'Overdue') {
            stateUpdate = {
              overdueTasksCollapsed: !this.state.overdueTasksCollapsed
            }
          }
          this.setState(stateUpdate)
        }} >
      </ListItem>
    )
  }

  _renderCreateTaskFooter() {

    return (
      <ListItem
        style={styles.footer}
        key={'create-task-item'}
        primaryText="Create Task"
        onTouchTap={(event) => {

          let listId = this._getListId()

          this.props.removeRightNavButton() // remove before transition
          hashHistory.push(`/task/create/${listId}`)
        }}>
      </ListItem>
    )
  }

  _getTasksToDisplay() {
    let myListId = this._getListId()

    let tasks = []

    for (let taskId in this.props.tasks) {
      let task = this.props.tasks[taskId]

      if (!task) continue;

      if (!task.dueDateTimeUtc && task.isCompleted) continue;

      // do not display completed task older than yesterday
      if (new Date(task.dueDateTimeUtc) < DateUtils.yesterday()
        && task.isCompleted) {
        continue;
      }

      if (myListId === AppConstants.ALL_TASKS_IDENTIFIER
          || myListId === task.listId) {
        tasks.push(task)
      }
    }

    return this._sortTasksByDateAndInsertHeaders(tasks)
  }

  _renderTasks() {
    let listItems = []
    let myListId = this._getListId()
    let tasksToDisplay = this._getTasksToDisplay()

    for (let task of tasksToDisplay) {
      listItems.push(this._renderRow(task))
    }

    // add create task footer; if a specific list is selected
    if (myListId !== AppConstants.ALL_TASKS_IDENTIFIER) {
      listItems.push(this._renderCreateTaskFooter())
    }

    // if no tasks exist, and no list selected, display
    // text so that the screen is not blank
    if (myListId === AppConstants.ALL_TASKS_IDENTIFIER
      && tasksToDisplay.length === 0) {

        // TODO - consider adding a more accessible way to create a task
        // for this scenario, like a link, etc

        return (
          <div style={styles.emptyListText}>
            Navigate to a new or existing list, then create a task.
          </div>
        )
    }

    return <List>
        {listItems}
      </List>
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this._renderTasks()}
      </MuiThemeProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  tasks: state.entities.tasks,
  // TODO - currently selected list id
})

const mapDispatchToProps = {
  setRightNavButton: NavbarActions.setRightNavButton,
  removeRightNavButton: NavbarActions.removeRightNavButton,
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiTaskPage)
