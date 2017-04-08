/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'

import AppConstants from '../constants'
import AppStyles from '../styles'

import * as NavbarActions from '../actions/navbar'

const shell = require('electron').shell;

const styles = {
  textField: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: '100%',
  },
  linkText: {
    fontSize: '90%',
    color: AppStyles.linkColor,
    cursor: 'pointer'
  },
  button: {
    width: 200,
    fontSize: '120%',
    marginTop: 10,
    marginBottom: 10
  },
  premiumButtonLabel: {
    textTransform: 'none',
    fontSize: '100%'
  },
}

class PremiumTour extends Component {

  componentDidMount() {
    this.props.setNavbarTitle('Premium')
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
  }

  render() {

    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>
          <h4>Algernon Premium</h4>

          <div style={styles.textField}>
            Organize your goals, track your progress, and have updates seamlessly sync across all of your devices.
          </div>

          <RaisedButton
            label="Get Premium"
            labelStyle={styles.premiumButtonLabel}
            backgroundColor={AppStyles.buttonColor}
            style={{
              ...styles.button,
              ...AppStyles.centeredElement
            }}
            onTouchTap={() => {
              shell.openExternal(AppConstants.ACCOUNT_UPGRADE_LINK)
            }}
           />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ /* TODO */ })

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton
}

export default connect(mapStateToProps, mapDispatchToProps)(PremiumTour)
