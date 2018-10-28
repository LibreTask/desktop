/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
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

import AppConstants from "../constants";
import AppStyles from "../styles";

import Validator from "validator";

const styles = {
  button: {
    marginBottom: 10,
    marginTop: 30,
    fontSize: "140%"
  }
};

class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sigupError: "",
      isSigningUp: false,
      currentEmail: "",
      currentPassword: "",
      currentConfirmPassword: "",
      emailValidationError: "",
      passwordValidationError: "",
      confirmPasswordValidationError: ""
    };
  }

  componentDidMount() {
    this.props.setNavbarTitle("Signup");
  }

  _signup = () => {
    if (this.state.isSigningUp) {
      return;
    }

    let email = this.state.currentEmail;
    let password = this.state.currentPassword;
    let confirmPassword = this.state.currentConfirmPassword;

    let emailValidationError = "";
    let passwordValidationError = "";
    let confirmPasswordValidationError: "";

    if (!Validator.isEmail(email)) {
      emailValidationError = "Email is not valid";
    }

    if (!Validator.isLength(password, { min: 6, max: 100 })) {
      passwordValidationError = "Password must be between 6 and 100 characters";
    }

    // only check whether password equals confirm password, if password is valid
    if (!passwordValidationError && password !== confirmPassword) {
      confirmPasswordValidationError = "Passwords do not match";
    }

    if (
      passwordValidationError ||
      emailValidationError ||
      confirmPasswordValidationError
    ) {
      this.setState({
        signupError: "",
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError,
        confirmPasswordValidationError: confirmPasswordValidationError
      });

      return; // validation failed; cannot signup
    }

    this.setState(
      {
        isSigningUp: true,
        signupError: "",
        emailValidationError: "",
        passwordValidationError: "",
        confirmPasswordValidationError: ""
      },
      () => {
        UserController.signup(email, password)
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
              signupError: error.message,
              isSigningUp: false
            });
          });
      }
    );
  };

  render = () => {
    let progress = <div />;
    let windowOpacity = 1;

    if (this.state.isSigningUp) {
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
            (AppStyles.centeredWindow,
            {
              opacity: windowOpacity
            })
          }
        >
          <TextField
            style={AppStyles.centeredElement}
            hintText="Email"
            errorText={this.state.emailValidationError}
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

          {/* NOTE: Multiline passwords are not supported by MaterialUI. */}
          <TextField
            style={AppStyles.centeredElement}
            errorText={this.state.confirmPasswordValidationError}
            hintText="Confirm Password"
            floatingLabelText="Confirm Password"
            type="password"
            onChange={(event, confirmPassword) => {
              this.setState({ currentConfirmPassword: confirmPassword });
            }}
          />

          <RaisedButton
            label="Signup"
            style={{
              ...AppStyles.centeredElement,
              ...styles.button
            }}
            onTouchTap={this._signup}
          />

          <div style={AppStyles.errorText}>{this.state.signupError}</div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
