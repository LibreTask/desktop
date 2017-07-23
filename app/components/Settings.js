/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import Checkbox from "material-ui/Checkbox";

import AppConstants from "../constants";
import AppStyles from "../styles";

import * as UserActions from "../actions/entities/user";
import * as UserController from "../models/controllers/user";
import * as ProfileStorage from "../models/storage/profile-storage";
import * as NavbarActions from "../actions/ui/navbar";

const styles = {
  showCompletedTasksCheckbox: {
    marginTop: 25,
    marginBottom: 5
  }
};

class Settings extends Component {
  componentDidMount() {
    this.props.setNavbarTitle("Settings");
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON);
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton();
  }

  _updateProfileLocally = (profile, shouldQueueUpdate) => {
    if (shouldQueueUpdate) {
      // TODO
    }

    this.props.createOrUpdateProfile(profile);
    ProfileStorage.createOrUpdateProfile(profile);
  };

  render() {
    let profile = this.props.profile;
    let showCompletedTasks = profile && profile.showCompletedTasks;

    return (
      <div style={AppStyles.mainWindow}>
        <div style={AppStyles.centeredWindow}>
          <Checkbox
            style={styles.showCompletedTasksCheckbox}
            label="Show completed tasks"
            checked={showCompletedTasks}
            onClick={event => {
              let updatedProfile = this.props.profile;
              updatedProfile.showCompletedTasks = !updatedProfile.showCompletedTasks;

              if (UserController.canAccessNetwork(updatedProfile)) {
                UserController.updateProfile(updatedProfile)
                  .then(response => {
                    let profile = response.profile;

                    // TODO - handle PW in more secure way
                    profile.password = this.props.profile.password;

                    this._updateProfileLocally(profile);
                  })
                  .catch(error => {
                    if (error.name === "NoConnection") {
                      let shouldQueueUpdate = true;
                      this._updateProfileLocally(
                        updatedProfile,
                        shouldQueueUpdate
                      );
                    } else {
                      this.setState({
                        updateError: error.message,
                        isUpdatingProfile: false
                      });
                    }
                  });
              } else {
                let shouldQueueUpdate = true;
                this._updateProfileLocally(updatedProfile, shouldQueueUpdate);
              }
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  profile: state.entities.user.profile
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
