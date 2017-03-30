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
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton'

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'
import * as UserController from '../models/controllers/user'

import { SingleDatePicker } from 'react-dates'
import moment from 'moment'

import AppConstants from '../constants'
import AppStyles from '../styles'

import Validator from 'validator'

const styles = {
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

class SingleTaskPage extends Component {

  constructor(props) {
    super(props)

    this.state = {
      deleteError: '',
      updateError: '',
      updateSuccess: '',
      isDeleting: false,
      isUpdating: false,
      deleteTaskDialogIsOpen: false,

      recurringFrequencyDialogIsOpen: false,

      // TODO - we keep these references in case props are updated
        // eg: when this exact task is deleted
        // but how can we do this cleaner?

      // copy objects, so that editing does not modify originals
      editedTask: Object.assign({}, this._getTask()),

      nameValidationError: '',
      notesValidationError: '',
      datePickerIsFocused: false
    }
  }

  componentDidMount() {
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
    this.props.setMediumRightNavButton(AppConstants.SAVE_NAVBAR_BUTTON)
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON)
    this.props.setNavbarTitle('Edit Task')
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
    this.props.removeMediumRightNavButton()
    this.props.removeFarRightNavButton()
  }

  componentWillReceiveProps(nextProps) {

    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.SAVE_NAV_ACTION) {
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
          hashHistory.replace('/tasks')
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
    hashHistory.replace('/tasks')
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
        onTouchTap={() => {
          this.setState({recurringFrequencyDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Update"
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

    const selectedDate =
      this.state.editedTask.dueDateTimeUtc
      ? moment(this.state.editedTask.dueDateTimeUtc)
      : undefined

    return (
      <SingleDatePicker
        withFullScreenPortal={true}
        reopenPickerOnClearDate={false}
        showClearDate={true}
        numberOfMonths={1}
        date={selectedDate}
        onDateChange={(selectedDate) => {
            let task = this.state.editedTask
            task.dueDateTimeUtc = selectedDate
            this.setState({editedTask: task})
        }}
        focused={this.state.datePickerIsFocused}
        onFocusChange={({focused}) =>  {
          this.setState({ datePickerIsFocused: focused })
        }}
        />
    )
  }

  render = () => {

    /*
    TODO - implement recurring frequency


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
    */

    // TODO - add other task attributes here as well

    let task = this.state.editedTask

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({deleteTaskDialogIsOpen: false})
        }}
      />,
      <FlatButton
        label="Yes"
        onTouchTap={() => {
          this.setState({deleteTaskDialogIsOpen: false})
          this._onDeleteTask()
        }}
      />,
    ];

    // TODO - consider scrollable dialog instead of dropdown

    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>
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
            style={{
              ...styles.textField,
              ...AppStyles.centeredElement
            }}
            multiLine={true}
            hintText="Name Field"
            floatingLabelText="Name"
            errorText={this.state.nameValidationError}
            type="text"
            value={task.name || ''}
            onChange={
              (event, name) => {

                // update our reference to task
                task.name = name

                this.setState({task: task})
              }
            }
          />

          <br/>

          <TextField
            multiLine={true}
            style={{
              ...styles.textField,
              ...AppStyles.centeredElement
            }}
            hintText="Notes Field"
            floatingLabelText="Notes"
            errorText={this.state.notesValidationError}
            type="text"
            value={task.notes || ''}
            onChange={
              (event, notes) => {

                // update our reference to task
                task.notes = notes

                this.setState({task: task})
              }
            }
          />

          <br/>

          {this._datePicker()}

          <br/>

          <div style={styles.errorText}>
            {this.state.updateError}
          </div>

          <div style={styles.successText}>
            {this.state.updateSuccess}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
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

export default connect(mapStateToProps, mapDispatchToProps)(SingleTaskPage)
