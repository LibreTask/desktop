/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Divider from 'material-ui/Divider'

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
  }
}

class About extends Component {

  componentDidMount() {
    this.props.setNavbarTitle('About')
  }

  render() {

    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>
          <h4>Algernon</h4>

          <div style={styles.textField}>
            Organize your goals, track your progress, and have updates seamlessly sync across all of your devices.
          </div>

          <Divider />

          <p style={styles.linkText} onClick={() => {
            shell.openExternal(AppConstants.WEBSITE_LINK)
          }}>
            Website
          </p>

          <Divider />

          <p style={styles.linkText} onClick={() => {
            shell.openExternal(AppConstants.SOURCE_CODE_LINK)
          }}>
            Source Code
          </p>

          <Divider />

          <p style={styles.linkText} onClick={() => {
            shell.openExternal(AppConstants.PRODUCT_PRIVACY_LINK)
          }}>
            Privacy Policy
          </p>

          <Divider />

          <p style={styles.linkText} onClick={() => {
            shell.openExternal(AppConstants.PRODUCT_TERMS_LINK)
          }}>
            Terms of Service
          </p>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({ /* TODO */ })

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle
}

export default connect(mapStateToProps, mapDispatchToProps)(About)
