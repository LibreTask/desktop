/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import NoConnection from './errors/NoConnection'
import ErrorCodes from './errors/ErrorCodes'

const API_ROOT = 'http://192.168.1.111:3001/api/v1/client/'
const Buffer = require('buffer').Buffer

const rp = require('request-promise')

export function constructAuthHeader(userId, password) {

  if (!userId || !password) {
    throw new 'Failed to construct auth header because of invalid arguments!'
  }

  return 'Basic ' + new Buffer(userId + ':' + password).toString('base64')
}

// TODO - move this to its own module
function humanReadableError(error) {

  try {
    let jsonError = JSON.parse(error.error)

    if (jsonError.errorCode === ErrorCodes.USER_DOES_NOT_EXIST) {
      return 'That user does not exist'
    } else if (jsonError.errorCode === ErrorCodes.EMAIL_IS_ALREADY_USED) {
      return 'That email is already used'
    } else {
      return 'Something went wrong, please try again later'
    }
  } catch (err) {
      return 'Something went wrong, please try again later'
  }
}

export function invoke(request) {
  let { endpoint } = request

  const { method, headers, body } = request

  const fullUrl = (endpoint.indexOf(API_ROOT) === -1)
        ? API_ROOT + endpoint
        : endpoint;

  const options = {
    uri: fullUrl,
    method: method,
    headers: headers,
    body: body,
  }

  return rp(options)
  .then( response => JSON.parse(response))
  .catch(error => {

    if (error.error && error.error.code === 'ECONNREFUSED') {
      throw new NoConnection();
    } else {
      throw new Error(humanReadableError(error))
    }
  });
}
