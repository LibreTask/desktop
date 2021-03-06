/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import Checkbox from "material-ui/Checkbox";

import AppConstants from "../constants";
import AppStyles from "../styles";

import * as UserActions from "../actions/entities/user";
import * as UserController from "../models/controllers/user";
import * as NavbarActions from "../actions/ui/navbar";

const styles = {
  showCompletedTasksCheckbox: {
    marginTop: 25,
    marginBottom: 5
  }
};

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCompletedTasks: props.profile.showCompletedTasks || false
    };
  }

  componentDidMount() {
    this.props.setNavbarTitle("Settings");
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON);
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton();
  }

  _queueProfileUpdate = profile => {
    // profile is queued only when network could not be reached
    this.props.addPendingProfileUpdate(profile);
  };

  _updateProfileLocally = profile => {
    this.props.createOrUpdateProfile(profile, this.props.isLoggedIn);

    this.setState({
      showCompletedTasks: profile.showCompletedTasks
    });
  };

  render() {
    return (
      <div style={AppStyles.mainWindow}>
        <div style={AppStyles.centeredWindow}>
          <Checkbox
            style={styles.showCompletedTasksCheckbox}
            label="Show completed tasks"
            checked={this.state.showCompletedTasks}
            onClick={event => {
              let updatedProfile = this.props.profile;
              updatedProfile.showCompletedTasks = !updatedProfile.showCompletedTasks;
              updatedProfile.updatedAtDateTimeUtc = new Date().getTime();

              /*
                Update profile locally, before checking network access. This is
                because we will perform a local update regardless, and doing
                so immediately is a much better user experience.
              */
              this._updateProfileLocally(updatedProfile);

              if (UserController.canAccessNetwork(updatedProfile)) {
                UserController.updateProfile(updatedProfile).catch(error => {
                  this._queueProfileUpdate(updatedProfile);
                });
              } else {
                this._queueProfileUpdate(updatedProfile);
              }
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  profile: state.entities.user.profile,
  isLoggedIn: state.entities.user.isLoggedIn
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  addPendingProfileUpdate: UserActions.addPendingProfileUpdate,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
