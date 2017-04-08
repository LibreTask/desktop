/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import RaisedButton from 'material-ui/RaisedButton'
import Divider from 'material-ui/Divider'

import AppConstants from '../constants'
import AppStyles from '../styles'

import * as NavbarActions from '../actions/navbar'

const styles = {
  leftTextField: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: '100%',
    marginLeft: 100
  },
  rightTextField: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: '100%',
    marginRight: 100
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
    this.props.setNavbarTitle('Algernon Premium')
    this.props.setLeftNavButton(AppConstants.BACK_NAVBAR_BUTTON)

    // TODO - enforce login
    this._constructCheckoutForm()
  }

  componentWillUnmount() {
    this.props.removeLeftNavButton()
  }

  _constructCheckoutForm = () => {
    const script = document.createElement("script")
    script.src = "https://checkout.stripe.com/checkout.js"
    script.className = "stripe-button"
    script.dataset.key = "pk_test_yv9mjFfNwC5ac7RHCbCg3jgf"
    script.dataset.amount = "1000" // cents
    script.dataset.email = this.props.profile.email || ''
    script.dataset.name = "Algernon"
    script.dataset.description = "Premium"
    script.dataset.label = "Get Premium"
    script.dataset.image = "https://stripe.com/img/documentation/checkout/marketplace.png"
    script.dataset.locale = "auto"
    script.dataset.zipCode = "true" // validate zipcode
    let form = document.getElementById('checkout-form')
    form.appendChild(script)
  }

  render() {

    return (
      <div style={AppStyles.mainWindow}>

        <div style={AppStyles.centeredWindow}>

          <div style={styles.leftTextField}>
            Sync tasks across devices
          </div>

          <Divider />

          <div style={styles.rightTextField}>
            Unlimited storage
          </div>

          <Divider />

          <div style={styles.leftTextField}>
            Industry-standard encryption
          </div>

          <Divider />

          <div style={styles.rightTextField}>
            Priority support
          </div>

          <br/>

          <form
            id="checkout-form"
            action="https://algernon.io/api/v1/client/user/upgrade-account"
            method="POST"/>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile,
})

const mapDispatchToProps = {
  setNavbarTitle: NavbarActions.setNavbarTitle,
  setLeftNavButton: NavbarActions.setLeftNavButton,
  removeLeftNavButton: NavbarActions.removeLeftNavButton
}

export default connect(mapStateToProps, mapDispatchToProps)(PremiumTour)
