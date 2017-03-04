/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import TextField from 'material-ui/TextField'
import MenuItem from 'material-ui/MenuItem'
import DatePicker from 'material-ui/DatePicker'
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'

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
    width: '100%'
  },
  radioButton: {
    marginTop: 12,
  },
  textField: {
    marginHorizontal: 12,
    fontSize: '100%',
    width: '100%'
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

      listDialogIsOpen: false,
      recurringFrequencyDialogIsOpen: false,

      // TODO - we keep these references in case props are updated
        // eg: when this exact task is deleted
        // but how can we do this cleaner?

      // copy objects, so that editing does not modify originals
      editedTask: Object.assign({}, this._getTask()),
      editedList: Object.assign({}, this._getList()),

      nameValidationError: '',
      notesValidationError: ''
    }
  }

  componentDidMount() {

    let task = this._getTask()

    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
    this.props.setMediumRightNavButton(AppConstants.EDIT_NAVBAR_BUTTON)
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON)
    this.props.setNavbarTitle('Edit List')
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
    this.props.removeMediumRightNavButton()
    this.props.removeFarRightNavButton()
  }

  componentWillReceiveProps(nextProps) {

    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.EDIT_NAV_ACTION) {
      this._onEditTask()
      this.props.setNavAction(undefined)
    } else if (nextProps.navAction === NavbarActions.DELETE_NAV_ACTION) {
      this.setState({deleteTaskDialogIsOpen: true })
      this.props.setNavAction(undefined)
    }
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
    let task = this.state.editedTask

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

    let task = this.state.editedTask

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

  _renderListDialog = () => {
    let radios = [];
    let initialIndex = 1;
    let currentIndex = 1;

    for (let listId in this.props.lists) {

      let list = this.props.lists[listId]

      radios.push(<RadioButton
        key={list.id}
        value={currentIndex}
        label={list.name}
        style={styles.radioButton} />)

      if (list.id === this.state.editedTask.listId) {
        initialIndex = currentIndex; // found the task's parent list
      }

      currentIndex += 1;
    }

    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onTouchTap={() => {
          this.setState({listDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Update"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => {
          this.setState({listDialogIsOpen: false})
        }}
      />,
    ]

    return (
      <Dialog
          title="List"
          actions={actions}
          modal={false}
          open={this.state.listDialogIsOpen}
          onRequestClose={() => {
            this.setState({listDialogIsOpen: false})
          }}
          autoScrollBodyContent={true}
        >
          <RadioButtonGroup
            name="lists"
            valueSelected={initialIndex}
            onChange={(event, value) => {
              let task = this.state.editedTask
              task.listId = Object.keys(this.props.lists)[value]
              this.setState({task: task})
            }}>
            {radios}
          </RadioButtonGroup>
        </Dialog>
    )
  }

  _renderRecurringFrequencyDialog = () => {

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

    let radios = [
      <RadioButton
        key='EVERYDAY'
        value={0}
        label='Everyday'
        style={styles.radioButton} />,
      <RadioButton
        key='ONCE'
        value={1}
        label='Once'
        style={styles.radioButton} />

      // TODO - expand these options
    ];

    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onTouchTap={() => {
          this.setState({recurringFrequencyDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Update"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => {
          this.setState({recurringFrequencyDialogIsOpen: false})
        }}
      />,
    ]

    let recurringFrequency = this.state.editedTask.recurringFrequency

    let initialIndex = (recurringFrequency in frequencyToIndex)
      ? frequencyToIndex[recurringFrequency]
      : defaultIndex

    return (
      <Dialog
          title="Recurring Frequency"
          actions={actions}
          modal={false}
          open={this.state.recurringFrequencyDialogIsOpen}
          onRequestClose={() => {
            this.setState({recurringFrequencyDialogIsOpen: false})
          }}
          autoScrollBodyContent={true}
        >
          <RadioButtonGroup
            name="recurring_frequencies"
            valueSelected={initialIndex}
            onChange={(event, value) => {
              let task = this.state.editedTask
              task.recurringFrequency = indexToFrequency[value]
              this.setState({task: task})
            }}>
            {radios}
          </RadioButtonGroup>
        </Dialog>
    )
  }

  _datePicker = () => {
    const minDate = new Date()
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)

    const defaultDate =
      this.state.editedTask.dueDateTimeUtc
      ? new Date(this.state.editedTask.dueDateTimeUtc)
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
            let task = this.state.editedTask
            task.dueDateTimeUtc = selectedDate
            this.setState({task: task})
        }}
      />
    )
  }

  render = () => {

    // TODO - add other task attributes here as well

    let task = this.state.editedTask
    let list = this.state.editedList

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

    // TODO - consider scrollable dialog instead of dropdown

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

        <TextField
          style={styles.textField}
          hintText="Name Field"
          floatingLabelText="Name"
          errorText={this.state.nameValidationError}
          type="text"
          value={task.name || ''}
          onChange={
            (event, name) => {

              // update our reference to task
              let list = this.state.editedTask
              task.name = name

              this.setState({task: task})
            }
          }
        />

        <br/>

        <TextField
          style={styles.textField}
          hintText="List"
          floatingLabelText="List"
          type="text"
          value={this.state.editedList.name || ''}
          onClick={() => {
            this.setState({listDialogIsOpen: true})
          }}
        />
        {this._renderListDialog()}

        <br/>

        <TextField
          multiLine={true}
          style={styles.textField}
          hintText="Notes Field"
          floatingLabelText="Notes"
          errorText={this.state.notesValidationError}
          type="text"
          value={task.notes || ''}
          onChange={
            (event, notes) => {

              // update our reference to list
              let list = this.state.editedTask
              task.notes = notes

              this.setState({task: task})
            }
          }
        />

        <br/>


        {this._datePicker()}

        <br/>

        <TextField
          style={styles.textField}
          hintText="Recurring Frequency"
          floatingLabelText="Recurring Frequency"
          type="text"
          value={task.recurringFrequency || ''}
          onClick={() => {
            this.setState({recurringFrequencyDialogIsOpen: true})
          }}
        />
        {this._renderRecurringFrequencyDialog()}

        <br/>

        <div style={styles.errorText}>
          {this.state.updateError}
        </div>

        <div style={styles.successText}>
          {this.state.updateSuccess}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
  lists: state.entities.lists,
  tasks: state.entities.tasks,
  navAction: state.ui.navbar.navAction
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
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction
}

export default connect(mapStateToProps, mapDispatchToProps)(EditTask)
