/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { hashHistory } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import IconButton from 'material-ui/IconButton'
import DatePicker from 'material-ui/DatePicker'

import * as NavbarActions from '../actions/navbar'
import * as TaskActions from '../actions/entities/task'
import * as TaskController from '../models/controllers/task'
import * as TaskStorage from '../models/storage/task-storage'
import * as UserController from '../models/controllers/user'

import Validator from 'validator'

import AppConstants from '../constants'
import AppStyles from '../styles'

const FaCommentO = require('react-icons/lib/fa/comment-o')
const FaCalendar = require('react-icons/lib/fa/calendar')

const styles = {
  button: {
    marginTop: 15,
  },
  errorText: {
    color: 'red'
  },
  createTaskButtonLabel: {
    textTransform: 'none',
  },
  mediumIcon: {
    width: 30,
    height: 30,
    display: 'inline-flex',
  },
  selectedIcon: {
    color: 'green'
  },
  floatingFooter: {
    position: 'fixed',
    margin: 'auto',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 10,
    minWidth: '300px',
    bottom: 0,
    left: 0,
    right: 0,
  },
  clearText: {
    color: 'red',
    fontSize: '90%',
    paddingTop: 10,
    paddingBottom: 10,
    cursor: 'pointer'
  }
}

class CreateTask extends Component {

  constructor(props) {
    super(props)

    this.state = {
      createError: '',
      isCreatingTask: false,
      currentName: '',
      currentNotes: '',
      selectedDate: '',
      nameValidationError: '',
      notesValidationError: '',
      notesIconSelected: false,
      calendarIconSelected: false
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Create Task')
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
  }

  _createTask = () => {
    let name = this.state.currentName
    let notes = this.state.currentNotes
    let dueDateTimeUtc = this.state.selectedDate

    let nameValidationError = ''
    let notesValidationError = ''

    if (!Validator.isLength(name, {min: 2, max: 100})) {
      nameValidationError = 'Name must be between 2 and 100 characters'
    }

    if (this.state.notesIconSelected
        && !Validator.isLength(notes, {min: 0, max: 5000})) {
        notesValidationError = 'Notes must be between 0 and 5000 characters'
    }

    if (nameValidationError || notesValidationError) {
      this.setState({
        nameValidationError: nameValidationError,
        notesValidationError: notesValidationError
      })

      return; // validation failed; cannot create task
    }

    if (UserController.canAccessNetwork(this.props.profile)) {
      this.setState({
        isCreatingTask: true,
        nameValidationError: '',
        notesValidationError: '',
        createError: ''
      }, () => {

        let userId = this.props.profile.id
        let pw = this.props.profile.password

        TaskController.createTask(name, notes, dueDateTimeUtc, userId, pw)
        .then( response => {

          let task = response.task
          task.isCompleted = false // initialize to false

          TaskStorage.createOrUpdateTask(task)
          this.props.createOrUpdateTask(task)

          // navigate to main on success
          hashHistory.replace('/tasks')
         })
         .catch( error => {

             if (error.name === 'NoConnection') {
               this._createTaskLocallyAndRedirect(name)
             } else {
               this.setState({
                 createError: error.message,
                 isCreatingTask: false
               })
             }
         })
      })
    } else {
      this._createTaskLocallyAndRedirect(name, notes, dueDateTimeUtc)
    }
  }

  _createTaskLocallyAndRedirect = (name, notes, dueDateTimeUtc) => {

    // create task locally; user it not logged in or has no network connection
    let task = TaskController.constructTaskLocally(name, notes, dueDateTimeUtc)
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)

    // navigate to main on success
    hashHistory.replace('/tasks')
  }

  _constructNotesTextEdit = () => {

    if (!this.state.notesIconSelected) {
      return <span/>
    }

    return (
      <span>
        <TextField
          multiLine={true}
          style={AppStyles.centeredElement}
          errorText={this.state.notesValidationError}
          floatingLabelText="Notes"
          type="text"
          onChange={
            (event, notes) => {
              this.setState({currentNotes: notes})
            }
          }
        />

        <br/>
      </span>
    )
  }

  _constructDatePicker = () => {

    if (!this.state.calendarIconSelected) {
      return <span/>
    }

    const minDate = new Date()
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 10)

    const selectedDate =
      this.state.selectedDate
      ? new Date(this.state.selectedDate)
      : undefined

    let clearDateButton = (
      <div
        style={styles.clearText}
        onClick={() => {
          this.setState({selectedDate: undefined}) // unset the date
        }}>
        Clear Due Date
      </div>
    )

    return (
      <span>
        <DatePicker
          textFieldStyle={AppStyles.centeredElement}
          floatingLabelText="Due Date"
          autoOk={false}
          minDate={minDate}
          maxDate={maxDate}
          container="inline"
          value={selectedDate}
          disableYearSelection={false}
          onChange={(skip, selectedDate) => {
              this.setState({selectedDate: selectedDate})
          }}
        />
        <br/>
        {this.state.selectedDate ? clearDateButton : <span/>}
      </span>
    )
  }

  _constructAttributeIcons = () => {

    let notesIconStyle = styles.mediumIcon
    if (this.state.notesIconSelected) {
      notesIconStyle = {
        ...styles.mediumIcon,
        ...styles.selectedIcon
      }
    }

    let calendarIconStyle = styles.mediumIcon
    if (this.state.calendarIconSelected) {
      calendarIconStyle = {
        ...styles.mediumIcon,
        ...styles.selectedIcon
      }
    }

    return (
      <div>
        <IconButton
          iconStyle={notesIconStyle}
          onTouchTap={() => {
            this.setState({
              notesIconSelected: !this.state.notesIconSelected
            })
          }}>
            <FaCommentO/>
        </IconButton>

        <IconButton
          iconStyle={calendarIconStyle}
          onTouchTap={() => {
            this.setState({
              calendarIconSelected: !this.state.calendarIconSelected
            })
          }}>
            <FaCalendar/>
        </IconButton>
      </div>
    )
  }

  render = () => {
    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>

          <TextField
            multiLine={true}
            style={AppStyles.centeredElement}
            errorText={this.state.nameValidationError}
            floatingLabelText="Name"
            type="text"
            onChange={
              (event, name) => {
                this.setState({currentName: name})
              }
            }
          />

          <br/>

          {this._constructNotesTextEdit()}

          {this._constructDatePicker()}

          <div style={styles.errorText}>
            {this.state.createError}
          </div>
        </div>

        <div style={styles.floatingFooter}>
          <RaisedButton
            style={{
              ...AppStyles.centeredElement,
              ...styles.button
            }}
            labelStyle={styles.createTaskButtonLabel}
            label="Create"
            onTouchTap={this._createTask}
           />

           {this._constructAttributeIcons()}

        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
})

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTask)
