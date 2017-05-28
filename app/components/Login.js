/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { hashHistory } from "react-router";
import { connect } from "react-redux";

import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";

import * as NavbarActions from "../actions/ui/navbar";
import * as UserController from "../models/controllers/user";
import * as ProfileStorage from "../models/storage/profile-storage";
import * as UserActions from "../actions/entities/user";

import AppStyles from "../styles";
import AppConstants from "../constants";

import Validator from "validator";

const shell = require("electron").shell;

const styles = {
  button: {
    marginBottom: 10,
    marginTop: 10,
    fontSize: "140%"
  },
  link: {
    color: AppStyles.linkColor,
    cursor: "pointer",
    fontSize: "90%",
    marginTop: 15,
    marginBottom: 15
  }
};

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loginError: "",
      isLoggingIn: false,
      currentEmail: "",
      currentPassword: "",
      emailValidationError: "",
      passwordValidationError: ""
    };
  }

  componentDidMount() {
    this.props.setNavbarTitle("Login");
  }

  _login = () => {
    let email = this.state.currentEmail;
    let password = this.state.currentPassword;

    let emailValidationError = "";
    let passwordValidationError = "";

    if (!Validator.isEmail(email)) {
      emailValidationError = "Email is not valid";
    }

    if (!Validator.isLength(password, { min: 6, max: 100 })) {
      passwordValidationError = "Password must be between 6 and 100 characters";
    }

    if (passwordValidationError || emailValidationError) {
      this.setState({
        loginError: "",
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError
      });

      return; // validation failed; cannot login
    }

    this.setState(
      {
        isLoggingIn: true,
        loginError: "",
        emailValidationError: "",
        passwordValidationError: ""
      },
      () => {
        UserController.login(email, password)
          .then(response => {
            let profile = response.profile;

            // TODO - handle PW in more secure way
            profile.password = password;

            this.props.createOrUpdateProfile(profile);
            ProfileStorage.createOrUpdateProfile(profile);

            hashHistory.replace("/tasks"); // navigate to main on successful login
          })
          .catch(error => {
            this.setState({
              loginError: error.message,
              isLoggingIn: false
            });
          });
      }
    );
  };

  render = () => {
    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>
          <TextField
            multiLine={true}
            style={AppStyles.centeredElement}
            errorText={this.state.emailValidationError}
            hintText="Email"
            floatingLabelText="Email"
            type="email"
            onChange={(event, email) => {
              this.setState({ currentEmail: email });
            }}
          />

          <br />

          {/* NOTE: Multiline passwords are not supported by MaterialUI. */}
          <TextField
            style={AppStyles.centeredElement}
            errorText={this.state.passwordValidationError}
            hintText="Password"
            floatingLabelText="Password"
            type="password"
            onChange={(event, password) => {
              this.setState({ currentPassword: password });
            }}
          />

          <br />

          <p
            style={styles.link}
            onClick={() => {
              shell.openExternal(AppConstants.PASSWORD_RESET_LINK);
            }}
          >
            Forgot password?
          </p>

          <div style={AppStyles.errorText}>
            {this.state.loginError}
          </div>

          <RaisedButton
            label="Login"
            style={{
              ...styles.button,
              ...AppStyles.centeredElement
            }}
            onTouchTap={this._login}
          />
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  /* TODO */
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
