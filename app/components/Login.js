/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { hashHistory } from "react-router";
import { connect } from "react-redux";

import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import CircularProgress from "material-ui/CircularProgress";

import * as NavbarActions from "../actions/ui/navbar";
import * as UserController from "../models/controllers/user";
import * as UserActions from "../actions/entities/user";

import AppStyles from "../styles";
import AppConstants from "../constants";

import Validator from "validator";

const shell = require("electron").shell;

const styles = {
  button: {
    marginBottom: 10,
    marginTop: 30,
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
    if (this.state.isLoggingIn) {
      return;
    }

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

            // preserve any of the offline-configured profile preferences
            profile.showCompletedTasks =
              this.props.profile && this.props.profile.showCompletedTasks;

            this.props.createOrUpdateProfile(profile);

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
    let progress = <div />;
    let windowOpacity = 1;

    if (this.state.isLoggingIn) {
      progress = (
        <CircularProgress
          style={AppStyles.progressSpinner}
          size={60}
          thickness={7}
        />
      );
      windowOpacity = AppStyles.loadingOpacity;
    }

    return (
      <div style={AppStyles.mainWindow}>
        {progress}

        <div
          style={
            (
              AppStyles.centeredWindow,
              {
                opacity: windowOpacity
              }
            )
          }
        >
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

          <RaisedButton
            label="Login"
            style={{
              ...AppStyles.centeredElement,
              ...styles.button
            }}
            onTouchTap={this._login}
          />

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
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
