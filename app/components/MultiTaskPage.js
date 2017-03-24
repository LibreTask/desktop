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
import * as TaskViewActions from '../actions/taskview'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'

import DateUtils from '../utils/date-utils'
import AppConstants from '../constants'
import AppStyles from '../styles'

const styles = {
  listItem: {
    color: 'black',
    fontSize: '90%'
  },
  listItemHeader: {
    color: 'black',
    fontSize: '90%',
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
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Tasks')
    this.props.setFarRightNavButton(AppConstants.CREATE_NAVBAR_BUTTON)
  }

  componentWillUnmount() {
    this.props.removeFarRightNavButton()
  }

  componentWillReceiveProps(nextProps) {

    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.CREATE_NAV_ACTION) {
      this.props.removeFarRightNavButton() // remove before transition
      this.props.setNavAction(undefined)
      hashHistory.push('/task/create')
    }
  }

  // TODO - clean up this sloppy logic / indirection; should not need a function
  _viewIsCollapsed(view) {
    return this.props.taskCategories[view].isCollapsed
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
          && this._viewIsCollapsed(TaskViewActions.TASKS_WITH_NO_DATE)) {
      return false
    }

    if (task.displayCategory === 'Today'
          && this._viewIsCollapsed(TaskViewActions.TODAYS_TASKS)) {
      return false
    }

    if (task.displayCategory === 'Tomorrow'
          && this._viewIsCollapsed(TaskViewActions.TOMORROWS_TASKS)) {
      return false
    }

    if (task.displayCategory === 'Future'
          && this._viewIsCollapsed(TaskViewActions.FUTURE_TASKS)) {
      return false
    }

    if (task.displayCategory === 'Overdue'
          && this._viewIsCollapsed(TaskViewActions.OVERDUE_TASKS)) {
      return false
    }

    return true
  }

  _isHeaderCurrentlyCollapsed(header) {
    if (header.name === 'No Date') {
      return this._viewIsCollapsed(TaskViewActions.TASKS_WITH_NO_DATE)
    } else if (header.name === 'Today') {
      return this._viewIsCollapsed(TaskViewActions.TODAYS_TASKS)
    } else if (header.name === 'Tomorrow') {
      return this._viewIsCollapsed(TaskViewActions.TOMORROWS_TASKS)
    } else if (header.name === 'Future') {
      return this._viewIsCollapsed(TaskViewActions.FUTURE_TASKS)
    } else if (header.name === 'Overdue') {
      return this._viewIsCollapsed(TaskViewActions.OVERDUE_TASKS)
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

              this.props.removeFarRightNavButton() // remove before transition
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
          if (header.name === 'No Date') {
            this.props.toggleTaskView(TaskViewActions.TASKS_WITH_NO_DATE)
          } else if (header.name === 'Today') {
            this.props.toggleTaskView(TaskViewActions.TODAYS_TASKS)
          } else if (header.name === 'Tomorrow') {
            this.props.toggleTaskView(TaskViewActions.TOMORROWS_TASKS)
          } else if (header.name === 'Future') {
            this.props.toggleTaskView(TaskViewActions.FUTURE_TASKS)
          } else if (header.name === 'Overdue') {
            this.props.toggleTaskView(TaskViewActions.OVERDUE_TASKS)
          }
        }} >
      </ListItem>
    )
  }

  _getTasksToDisplay() {
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

      tasks.push(task)
    }

    return this._sortTasksByDateAndInsertHeaders(tasks)
  }

  _renderTasks() {
    let listItems = []
    let tasksToDisplay = this._getTasksToDisplay()

    for (let task of tasksToDisplay) {
      listItems.push(this._renderRow(task))
    }

    return (
      <List>
          {listItems}
      </List>
    )
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
  tasks: state.entities.tasks,
  navAction: state.ui.navbar.navAction,
  taskCategories: state.ui.taskview,
})

const mapDispatchToProps = {
  collapseTaskView: TaskViewActions.collapseCategory,
  showTaskView: TaskViewActions.showCategory,
  toggleTaskView: TaskViewActions.toggleCategory,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiTaskPage)
