/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import Divider from 'material-ui/Divider'
import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'
import * as UserController from '../models/controllers/user'

import dateFormat from 'dateformat'

import AppConstants from '../constants'

const styles = {
  main: {
    margin: 12,
    color: '#000000',
  },
  button: {
    marginBottom: 20,
    marginTop: 20,
    marginLeft: 20,
    marginRight: 20,
    fontSize: '110%'
  },
  header: {
    fontSize: '110%',
    fontWeight: 'bold'
  },
  taskFont: {
    fontSize: '100%',
    whiteSpace: 'pre-wrap',
    marginTop: 10,
    marginBottom: 10
  },
  divider: {
    marginTop: 10,
    marginBottom: 10
  }
}

class SingleTaskPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      deleteError: '',
      isDeleting: false,
      deleteTaskDialogIsOpen: false,

      // TODO - we keep these references in case props are updated
        // eg: when this exact task is deleted
        // but how can we do this cleaner?
      task: this._getTask(),
      list: this._getList()
    }
  }

  componentDidMount() {

    let task = this._getTask()

    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
    this.props.setMediumRightNavButton(AppConstants.EDIT_NAVBAR_BUTTON)
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON)
    this.props.setNavbarTitle(task.name)
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
    this.props.removeMediumRightNavButton()
    this.props.removeFarRightNavButton()
  }

  _getTask = () => {
    let id = this.props.router.params.taskId;
    return this.props.tasks[id]
  }

  _getList = () => {
    let task = this._getTask()
    return this.props.lists[task.listId]
  }

  /*
    Method invocation assumes an 'Are you sure?'
    dialog has been displayed.
  */
  _onDeleteTask = () => {
    let task = this.state.task

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({isDeleting: true}, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        TaskController.deleteTask(task.id, userId, pw)
        .then( response => {
          this._deleteTaskLocallyAndRedirect(task)
         })
         .catch( error => {

           if (error.name === 'NoConnection') {
            this._deleteTaskLocallyAndRedirect(task)
           } else {
             this.setState({
               deleteError: error.message,
               isDeleting: false
             })
           }
         })
      })
    } else {
      this._deleteTaskLocallyAndRedirect(task)
    }
  }

  _deleteTaskLocallyAndRedirect = (task) => {
    TaskStorage.deleteTaskByTaskId(task.id)
    this.props.deleteTask(task.id)
    hashHistory.replace(`/tasks/${task.listId}`)
  }

  _renderRecurringFrequency = () => {
    let frequencyToHumanReadable = {
      'EVERYDAY': 'Everyday',
      'ONCE': 'Once'
    }

    let frequency = this.state.task.recurringFrequency

    return (frequency in frequencyToHumanReadable)
      ? frequencyToHumanReadable[frequency]
      : 'Currently unspecified'
  }

  render = () => {

    let task = this.state.task
    let list = this.state.list

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({deleteTaskDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Yes"
        keyboardFocused={true}
        onTouchTap={() => {
          this.setState({deleteTaskDialogIsOpen: false})
          this._onDeleteTask()
        }}
      />,
    ];

    return (
      <div style={styles.main}>
        <Dialog
          title={'Task Deletion'}
          actions={actions}
          modal={false}
          open={this.state.deleteTaskDialogIsOpen}
          onRequestClose={() => {
              this.setState({deleteTaskDialogIsOpen: false})
          }}
        >
          Are you sure you want to delete this task?
        </Dialog>

        <div style={styles.header}>
          List
        </div>

        <div style={styles.taskFont}>
          {list.name}
        </div>

        <Divider style={styles.divider}/>

        <div style={styles.header}>
          Notes
        </div>

        <div style={styles.taskFont}>
          {task.notes || 'No notes yet'}
        </div>

        <Divider style={styles.divider}/>

        <div style={styles.header}>
          Due Date
        </div>

        <div style={styles.taskFont}>
          {
            task.dueDateTimeUtc
            ? dateFormat(task.dueDateTimeUtc, 'mmmm d')
            : 'No due date yet'
          }
        </div>

        <Divider style={styles.divider}/>

        <div style={styles.header}>
          Recurring Frequency
        </div>

        <div style={styles.taskFont}>
          { this._renderRecurringFrequency()}
        </div>

        <RaisedButton
          label="Edit"
          style={styles.button}
           onTouchTap={() => {
              hashHistory.push(`/task/${task.id}/edit`)
           }}
         />

         <RaisedButton
           label="Delete"
           style={styles.button}
           onTouchTap={() => {
             this.setState({deleteTaskDialogIsOpen: true })
           }}
          />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  tasks: state.entities.tasks
})

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  deleteTask: TaskActions.deleteTask,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton,
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage)
