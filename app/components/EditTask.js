/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import Dialog from 'material-ui/Dialog'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import DatePicker from 'material-ui/DatePicker'

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'
import * as UserController from '../models/controllers/user'

import AppConstants from '../constants'
import Validator from 'validator'

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
    fontSize: '120%'
  },
  textField: {
    fontSize: '120%'
  },
  errorText: {
    color: 'red'
  },
  successText: {
    color: 'green'
  }
}

class EditTask extends Component {

  constructor(props) {
    super(props)

    this.state = {
      deleteError: '',
      updateError: '',
      updateSuccess: '',
      isDeleting: false,
      isUpdating: false,
      deleteTaskDialogIsOpen: false,

      // TODO - we keep these references in case props are updated
        // eg: when this exact task is deleted
        // but how can we do this cleaner?
      task: this._getTask(),
      list: this._getList(),

      nameValidationError: '',
      notesValidationError: ''
    }
  }

  componentDidMount() {

    let task = this._getTask()

    this.props.setRightNavButton(AppConstants.BACK_NAVBAR_BUTTON)
    this.props.setNavbarTitle('Edit List')
  }

  componentWillUnmount() {
    this.props.removeRightNavButton()
  }

  _getTask = () => {
    let id = this.props.router.params.taskId;
    return this.props.tasks[id]
  }

  _getList = () => {
    let task = this._getTask()
    return this.props.lists[task.listId]
  }

  _onEditTask = () => {
    let task = this.state.task

    let nameValidationError = ''
    let notesValidationError = ''

    let updatedName = task.name || ''
    let updatedNotes = task.notes || ''

    if (!Validator.isLength(updatedName, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (!Validator.isLength(updatedNotes, {min: 0, max: 5000})) {
      notesValidationError = 'Notes must be between 0 and 5000 characters'
    }

    if (nameValidationError || notesValidationError) {
      this.setState({
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      })

      return; // validation failed; cannot updated task
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({
        isUpdating: true,
        nameValidationError: '',
        notesValidationError: ''
      }, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        TaskController.updateTask(task, userId, pw)
        .then( response => {

          TaskStorage.createOrUpdateTask(task)
          this.props.createOrUpdateTask(task)
          hashHistory.replace(`/tasks/${task.listId}`)
         })
         .catch( error => {

            if (error.name === 'NoConnection') {
              this._updateTaskLocally(task)
            } else {
              this.setState({
                updateError: error.message,
                isUpdating: false
              })
            }
         })
      })
    } else {
      this._updateTaskLocally(task)
    }
  }

  _updateTaskLocally = (task) => {
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)

    this.setState({updateSuccess: 'Successfully updated'})

    // erase update success text after 1.5 seconds
    setTimeout(() => this.setState({updateSuccess: ''}), 1500)
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

  _listDropdown = () => {
    let menuItems = [];
    let initialIndex = 1;
    let currentIndex = 1;

    for (let listId in this.props.lists) {

      let list = this.props.lists[listId]

      menuItems.push(<MenuItem
        key={list.id}
        value={currentIndex}
        primaryText={list.name} />)

      if (list.id === this.state.task.listId) {
        initialIndex = currentIndex; // found the task's parent list
      }

      currentIndex += 1;
    }

    return <DropDownMenu
      value={initialIndex}
      onChange={(event, key, payload) => {
        let task = this.state.task
        task.listId = Object.keys(this.props.lists)[key]
        this.setState({task: task})
      }}>
      {menuItems}
    </DropDownMenu>
  }

  _recurringFrequencyDropdown = () => {

    let frequencyToIndex = {
      'EVERYDAY': 0,
      'ONCE': 1
    }

    let indexToFrequency = {
      0: 'EVERYDAY',
      1: 'ONCE'
    }

    let defaultFrequency = 'ONCE'
    let defaultIndex = frequencyToIndex[defaultFrequency]

    let menuItems = [
      <MenuItem
        key='EVERYDAY'
        value={0}
        primaryText='Everyday' />,
      <MenuItem
        key='ONCE'
        value={1}
        primaryText='Once' />

      // TODO - expand these options
    ];


    let recurringFrequency = this.state.task.recurringFrequency

    let initialIndex = (recurringFrequency in frequencyToIndex)
      ? frequencyToIndex[recurringFrequency]
      : defaultIndex

    return <DropDownMenu
      value={initialIndex}
      onChange={(event, key, payload) => {
        let task = this.state.task
        task.recurringFrequency = indexToFrequency[key]
        this.setState({task: task})
      }}>
      {menuItems}
    </DropDownMenu>
  }

  _datePicker = () => {
    const minDate = new Date()
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)

    const defaultDate =
      this.state.task.dueDateTimeUtc
      ? new Date(this.state.task.dueDateTimeUtc)
      : minDate

    return (
      <DatePicker
        floatingLabelText="Due Date"
        defaultDate={defaultDate}
        autoOk={false}
        minDate={minDate}
        maxDate={maxDate}
        container="inline"
        disableYearSelection={false}
        onChange={(skip, selectedDate) => {
            let task = this.state.task
            task.dueDateTimeUtc = selectedDate
            this.setState({task: task})
        }}
      />
    )
  }

  render = () => {

    // TODO - add other task attributes here as well

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
          title="Delete Task"
          actions={actions}
          modal={false}
          open={this.state.deleteTaskDialogIsOpen}
          onRequestClose={() => {
              this.setState({deleteTaskDialogIsOpen: false})
          }}
        >
          Are you sure you want to delete this task?
        </Dialog>

        <h3> Name </h3>

        <TextField
          style={styles.TextField}
          hintText="Name Field"
          floatingLabelText="Name"
          errorText={this.state.nameValidationError}
          type="text"
          value={task.name || ''}
          onChange={
            (event, name) => {

              // update our reference to task
              let list = this.state.task
              task.name = name

              this.setState({task: task})
            }
          }
        />

        <br/>

        <h3> List </h3>
        {this._listDropdown()}

        <br/>

        <h3> Notes </h3>

        <TextField
          style={styles.TextField}
          hintText="Notes Field"
          floatingLabelText="Notes"
          errorText={this.state.notesValidationError}
          type="text"
          value={task.notes || ''}
          onChange={
            (event, notes) => {

              // update our reference to list
              let list = this.state.task
              task.notes = notes

              this.setState({task: task})
            }
          }
        />

        <br/>

        <h3> Due Date </h3>

        {this._datePicker()}

        <br/>

        <h3> Recurring Frequency </h3>

        {this._recurringFrequencyDropdown()}

        <br/>

        <div style={styles.errorText}>
          {this.state.updateError}
        </div>

        <div style={styles.successText}>
          {this.state.updateSuccess}
        </div>

        <br/>

        <RaisedButton
          label="Update"
          style={styles.button}
           onTouchTap={this._onEditTask}
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
  setRightNavButton: NavbarActions.setRightNavButton,
  removeRightNavButton: NavbarActions.removeRightNavButton,
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTask)
