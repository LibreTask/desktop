/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { hashHistory } from "react-router";
import { connect } from "react-redux";

import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import CircularProgress from "material-ui/CircularProgress";

import * as NavbarActions from "../actions/ui/navbar";
import * as UserActions from "../actions/entities/user";
import * as UserController from "../models/controllers/user";

import moment from "moment";

import AppConstants from "../constants";
import AppStyles from "../styles";
import Validator from "validator";

const shell = require("electron").shell;

const styles = {
  input: {
    fontSize: "120%"
  },
  button: {
    width: 200,
    fontSize: "120%"
  },
  spacer: {
    marginTop: 12,
    marginBottom: 12
  },
  profileButtonLabel: {
    textTransform: "none",
    fontSize: "100%"
  },
  successText: {
    color: "green"
  }
};

class Profile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      updateError: "",
      updateSuccess: "",
      isUpdatingProfile: false,
      currentEmail: this.props.profile.email || "",
      deleteProfileDialogIsOpen: false,
      emailValidationError: ""
    };
  }

  componentDidMount() {
    this.props.setMediumRightNavButton(AppConstants.SAVE_NAVBAR_BUTTON);
    this.props.setFarRightNavButton(AppConstants.DELETE_NAVBAR_BUTTON);
    this.props.setNavbarTitle("Profile");
  }

  componentWillUnmount() {
    this.props.removeMediumRightNavButton();
    this.props.removeFarRightNavButton();
  }

  componentWillReceiveProps(nextProps) {
    // consume any actions triggered via the Navbar
    if (nextProps.navAction === NavbarActions.SAVE_NAV_ACTION) {
      this._onProfileUpdate();
      this.props.setNavAction(undefined);
    } else if (nextProps.navAction === NavbarActions.DELETE_NAV_ACTION) {
      this.setState({ deleteProfileDialogIsOpen: true });
      this.props.setNavAction(undefined);
    }

    /* TODO -
    should we keep a copy in memory and ONLY update it with a refresh button?

    we want to avoid having the page update by itself, overriding any user
    actions in progress.
    */
    // another device could have updated profile attributes
    //this.setState({ currentEmail: nextProps.profile.email });
  }

  _onProfileUpdate = () => {
    if (this.state.isUpdatingProfile) {
      return;
    }

    let updatedEmail = this.state.currentEmail || "";

    let emailValidationError = "";

    if (!Validator.isEmail(updatedEmail)) {
      emailValidationError = "Email is not valid";
    }

    if (emailValidationError) {
      this.setState({
        emailValidationError: emailValidationError
      });

      return; // validation failed; cannot updated profile
    }

    let updatedProfile = Object.assign({}, this.props.profile, {
      email: updatedEmail
    });

    this.setState(
      {
        isUpdatingProfile: true,
        updateError: "",
        updateSuccess: "",
        emailValidationError: ""
      },
      () => {
        UserController.updateProfile(updatedProfile)
          .then(response => {
            let profile = response.profile;

            // TODO - handle PW in more secure way
            profile.password = this.props.profile.password;

            this.props.createOrUpdateProfile(profile);

            this.setState(
              {
                isUpdatingProfile: false,
                updateSuccess: "Successfully updated"
              },
              () => {
                // erase update success text after 1.5 seconds
                setTimeout(() => this.setState({ updateSuccess: "" }), 1500);
              }
            );
          })
          .catch(error => {
            this.setState({
              updateError: error.message,
              isUpdatingProfile: false
            });
          });
      }
    );
  };

  /*
    Method invocation assumes an 'Are you sure?'
    dialog has been displayed.
  */
  _onProfileDelete = () => {
    /*
TODO
    if (this.state.isUpdatingProfile) {
      return;
    }
*/

    this.setState(
      {
        isUpdatingProfile: true,
        updateError: "",
        updateSuccess: "",
        emailValidationError: ""
      },
      () => {
        UserController.deleteProfile(this.props.profile)
          .then(response => {
            this.props.deleteProfile();
            hashHistory.replace("/tasks"); // navigate to main on deletion
          })
          .catch(error => {
            this.setState({
              updateError: error.message,
              isUpdatingProfile: false
            });
          });
      }
    );
  };

  _hasPremiumSubscription = () => {
    let today = new Date();

    return (
      this.props.profile &&
      this.props.profile.currentPlan === "premium" &&
      new Date(this.props.profile.planExpirationDateTimeUtc) > today
    );
  };

  _accountStatusButton = () => {
    let accountStatusButton;

    if (this._hasPremiumSubscription()) {
      accountStatusButton = (
        <RaisedButton
          style={{
            ...styles.button,
            ...AppStyles.centeredElement
          }}
          backgroundColor={AppStyles.buttonColor}
          labelStyle={styles.profileButtonLabel}
          label="Cancel Premium"
          onTouchTap={() => {
            shell.openExternal(AppConstants.ACCOUNT_DOWNGRADE_LINK);
          }}
        />
      );
    } else {
      accountStatusButton = (
        <RaisedButton
          style={{
            ...styles.button,
            ...AppStyles.centeredElement
          }}
          backgroundColor={AppStyles.buttonColor}
          labelStyle={styles.profileButtonLabel}
          label="Learn about Premium"
          onTouchTap={() => {
            shell.openExternal(AppConstants.ACCOUNT_UPGRADE_LINK);
          }}
        />
      );
    }

    return accountStatusButton;
  };

  _expirationDateDisplay = () => {
    if (this._hasPremiumSubscription()) {
      let planExpirationDateTimeUtc = this.props.profile
        .planExpirationDateTimeUtc;

      let formattedExpirationDate = planExpirationDateTimeUtc
        ? moment(planExpirationDateTimeUtc).format("LLLL")
        : "An error has occurred, please check back later";

      // Styling here is intended to be identical to a non-disabled TextField.
      return (
        <TextField
          style={{
            ...styles.input,
            ...AppStyles.centeredElement
          }}
          underlineDisabledStyle={{
            width: "100%",
            borderBottom: "1px solid #E0E0E0",
            borderBottomColor: "#E0E0E0"
          }}
          style={{
            cursor: "auto",
            color: "black",
            width: "100%"
          }}
          inputStyle={{
            color: "black",
            fontSize: "120%"
          }}
          floatingLabelStyle={{
            fontSize: "120%"
          }}
          disabled={true}
          floatingLabelText="Premium Plan Expiration"
          value={formattedExpirationDate}
        />
      );
    } else {
      return <span />;
    }
  };

  render = () => {
    let progress = <div />;
    let windowOpacity = 1;

    if (this.state.isUpdatingProfile) {
      progress = (
        <CircularProgress
          style={AppStyles.progressSpinner}
          size={60}
          thickness={7}
        />
      );
      windowOpacity = AppStyles.loadingOpacity;
    }

    const actions = [
      <FlatButton
        label="Cancel"
        onTouchTap={() => {
          this.setState({ deleteProfileDialogIsOpen: false });
        }}
      />,
      <FlatButton
        label="Yes"
        onTouchTap={() => {
          this.setState({ deleteProfileDialogIsOpen: false });
          this._onProfileDelete();
        }}
      />
    ];

    return (
      <div style={AppStyles.mainWindow}>
        {progress}

        <div style={(AppStyles.centeredWindow, { opacity: windowOpacity })}>
          <Dialog
            style={AppStyles.dialog}
            title="Profile Deletion"
            actions={actions}
            modal={false}
            open={this.state.deleteProfileDialogIsOpen}
            onRequestClose={() => {
              this.setState({ deleteProfileDialogIsOpen: false });
            }}
          >
            Are you sure you want to delete your profile?
          </Dialog>

          <br />

          <TextField
            style={{
              ...styles.input,
              ...AppStyles.centeredElement
            }}
            hintText="Email"
            floatingLabelText="Email"
            errorText={this.state.emailValidationError}
            type="email"
            value={this.state.currentEmail}
            underlineStyle={{
              width: "100%",
              borderBottom: "1px solid #E0E0E0",
              borderBottomColor: "#E0E0E0"
            }}
            onChange={(event, email) => {
              this.setState({ currentEmail: email });
            }}
          />

          {/* NOTE: hiding expiration and status button during beta

            {this._expirationDateDisplay()}

            <div style={styles.spacer} />

            {this._accountStatusButton()}

            <div style={styles.spacer} />
            */}

          <div style={AppStyles.errorText}>
            {this.state.updateError}
          </div>

          <div style={styles.successText}>
            {this.state.updateSuccess}
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = state => ({
  isLoggedIn: state.entities.user.isLoggedIn,
  profile: state.entities.user.profile,
  navAction: state.ui.navbar.navAction
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  deleteProfile: UserActions.deleteProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setNavAction: NavbarActions.setNavAction,
  setMediumRightNavButton: NavbarActions.setMediumRightNavButton,
  removeMediumRightNavButton: NavbarActions.removeMediumRightNavButton,
  setFarRightNavButton: NavbarActions.setFarRightNavButton,
  removeFarRightNavButton: NavbarActions.removeFarRightNavButton
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
