/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react';
import { hashHistory } from 'react-router';
import { connect } from 'react-redux'

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import * as NavbarActions from '../actions/navbar'
import * as UserController from '../models/controllers/user'
import * as ProfileStorage from '../models/storage/profile-storage'
import * as UserActions from '../actions/entities/user'

import AppStyles from '../styles'
import AppConstants from '../constants';

import Validator from 'validator'

const shell = require('electron').shell;

const styles = {
  main: {
    margin: 12,
    color: '#000000',
  },
  button: {
    marginBottom: 10,
    marginTop: 10,
    fontSize: '140%'
  },
  textField: {
    fontSize: '120%'
  },
  link: {
    color: AppStyles.linkColor,
    fontSize: '90%'
  },
  errorText: {
    color: 'red'
  }
};

class Login extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loginError: '',
      isLoggingIn: false,
      currentEmail: '',
      currentPassword: '',
      emailValidationError: '',
      passwordValidationError: ''
    }
  }

  componentDidMount() {
    this.props.setNavbarTitle('Login')
  }

  _login = () => {
    let email = this.state.currentEmail
    let password = this.state.currentPassword

    let emailValidationError = ''
    let passwordValidationError = ''

    if (!Validator.isEmail(email)) {
      emailValidationError = 'Email is not valid'
    }

    if (!Validator.isLength(password, {min: 6, max: 100})) {
      passwordValidationError = 'Password must be between 6 and 100 characters'
    }

    if (passwordValidationError || emailValidationError) {
      this.setState({
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError
      })

      return; // validation failed; cannot login
    }

    this.setState({
      isLoggingIn: true,
      loginError: '',
      emailValidationError: '',
      passwordValidationError: ''
    }, () => {
      UserController.login(email, password)
      .then( response => {

        let profile = response.profile

         // TODO - handle PW in more secure way
         profile.password = password

         this.props.createOrUpdateProfile(profile)
         ProfileStorage.createOrUpdateProfile(profile)

         hashHistory.replace('/'); // navigate to main on successful login
       })
       .catch( error => {
            this.setState({
             loginError: error.message,
             isLoggingIn: false
           });
       });
    })
  }

  render = () => {

    return (
      <div style={styles.main}>

        <TextField
          style={styles.TextField}
          errorText={this.state.emailValidationError}
          hintText="Email Field"
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
          style={styles.TextField}
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

        <p style={styles.link} onClick={() => {
          shell.openExternal(AppConstants.PASSWORD_RESET_LINK)
        }}>
          Forgot password?
        </p>

        <div style={styles.errorText}>
          {this.state.loginError}
        </div>

        <RaisedButton
          label="Login"
          style={styles.button}
           onTouchTap={this._login}
         />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ /* TODO */ });

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
