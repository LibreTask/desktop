/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { hashHistory } from 'react-router'
import { connect } from 'react-redux'

import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'

import * as NavbarActions from '../actions/navbar'
import * as UserController from '../models/controllers/user'
import * as ProfileStorage from '../models/storage/profile-storage'
import * as UserActions from '../actions/entities/user'

import AppConstants from '../constants'
import AppStyles from '../styles'

import Validator from 'validator'

const styles = {
  button: {
    marginBottom: 10,
    marginTop: 10,
    fontSize: '140%'
  },
  errorText: {
    color: 'red'
  }
}

class Signup extends Component {

  constructor(props) {
    super(props)

    this.state = {
      sigupError: '',
      isSigningUp: false,
      currentEmail: '',
      currentPassword: '',
      currentConfirmPassword: '',
      emailValidationError: '',
      passwordValidationError: '',
      confirmPasswordValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Signup')
  }

  _signup = () => {
    let email = this.state.currentEmail
    let password = this.state.currentPassword
    let confirmPassword = this.state.currentConfirmPassword

    let emailValidationError = ''
    let passwordValidationError = ''
    let confirmPasswordValidationError: ''

    if (!Validator.isEmail(email)) {
      emailValidationError = 'Email is not valid'
    }

    if (!Validator.isLength(password, {min: 6, max: 100})) {
      passwordValidationError = 'Password must be between 6 and 100 characters'
    }

    // only check whether password equals confirm password, if password is valid
    if (!passwordValidationError && password !== confirmPassword) {
      confirmPasswordValidationError = 'Passwords do not match'
    }

    if (passwordValidationError || emailValidationError
      || confirmPasswordValidationError) {
      this.setState({
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError,
        confirmPasswordValidationError: confirmPasswordValidationError
      })

      return; // validation failed; cannot signup
    }

    this.setState({
      isSigningUp: true,
      signupError: '',
      emailValidationError: '',
      passwordValidationError: '',
      confirmPasswordValidationError: ''
    }, () => {
      UserController.signup(email, password)
      .then( response => {

        let profile = response.profile

         // TODO - handle PW in more secure way
         profile.password = password

         ProfileStorage.createOrUpdateProfile(profile)
         this.props.createOrUpdateProfile(profile)

         hashHistory.replace('/') // navigate to main on successful login
       })
       .catch( error => {
           this.setState({
             signupError: error.message,
             isSigningUp: false
           })
       })
    })
  }

  render = () => {
    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>
          <TextField
            style={AppStyles.centeredElement}
            hintText="Email Field"
            errorText={this.state.emailValidationError}
            floatingLabelText="Email"
            type="email"
            onChange={
              (event, email) => {
                this.setState({currentEmail: email})
              }
            }
          />

          <br/>

          <TextField
            multiLine={true}
            style={AppStyles.centeredElement}
            errorText={this.state.passwordValidationError}
            hintText="Password Field"
            floatingLabelText="Password"
            type="password"
            onChange={
              (event, password) => {
                this.setState({currentPassword: password})
              }
            }
          />

          <br/>

          <TextField
            multiLine={true}
            style={AppStyles.centeredElement}
            errorText={this.state.confirmPasswordValidationError}
            hintText="Confirm Password Field"
            floatingLabelText="Confirm Password"
            type="password"
            onChange={
              (event, confirmPassword) => {
                this.setState({currentConfirmPassword: confirmPassword})
              }
            }
          />

          <div style={styles.errorText}>
            {this.state.signupError}
          </div>

          <RaisedButton
            label="Signup"
            style={{
              ...styles.button,
              ...AppStyles.centeredElement
            }}
            onTouchTap={this._signup}
           />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ /* TODO */ })

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup)
