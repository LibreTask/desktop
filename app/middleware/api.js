/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import RetryableError from "./errors/RetryableError";
import ErrorCodes from "./errors/ErrorCodes";

const API_ROOT = "http://localhost:3001/api/v1/"; //"https://libretask.org/api/v1/";
// TEST ENV - "http://192.168.1.111:3001/api/v1/";
// PROD ENV - "http://174.138.64.49/api/v1/";
// (production does not need port due to NGINX proxy)

const MAX_RETRIES = 3;

const Buffer = require("buffer").Buffer;

const rp = require("request-promise");

export function constructAuthHeader(userId, password) {
  if (!userId || !password) {
    throw new "Failed to construct auth header because of invalid arguments!"();
  }

  return "Basic " + new Buffer(userId + ":" + password).toString("base64");
}

// TODO - move this to its own module
// TODO - use a hash for this
function humanReadableError(error) {
  try {
    let jsonError = JSON.parse(error.error);

    if (jsonError.errorCode === ErrorCodes.USER_DOES_NOT_EXIST) {
      return "That user does not exist";
    } else if (jsonError.errorCode === ErrorCodes.EMAIL_IS_ALREADY_USED) {
      return "That email is already used";
    } else if (jsonError.errorCode === ErrorCodes.INVALID_LOGIN) {
      return "Either email or password is invalid";
    } else {
      return "Something went wrong, please try again later";
    }
  } catch (err) {
    return "Something went wrong, please try again later";
  }
}

export function invoke(request, retriesRemaining) {
  const { endpoint, method, headers, body } = request;

  return _invoke(endpoint, method, headers, body).catch(err => {
    if (retriesRemaining === undefined) {
      retriesRemaining = MAX_RETRIES;
    }

    let shouldRetry = err instanceof RetryableError;
    shouldRetry &= method === "GET";
    shouldRetry &= retriesRemaining >= 1;

    if (shouldRetry) {
      let retryAttemptNumber = MAX_RETRIES - retriesRemaining;

      return _retryWait(retryAttemptNumber).then(() => {
        return invoke(request, retriesRemaining - 1);
      });
    } else {
      throw err;
    }
  });
}

function _invoke(endpoint, method, headers, body) {
  const fullUrl =
    endpoint.indexOf(API_ROOT) === -1 ? API_ROOT + endpoint : endpoint;

  const options = {
    uri: fullUrl,
    method: method,
    headers: headers,
    body: body
  };

  return rp(options)
    .then(response => JSON.parse(response))
    .catch(error => {
      console.dir(error);

      if (_isRetryableError(error)) {
        throw new RetryableError();
      } else {
        throw new Error(humanReadableError(error));
      }
    });
}

function _isRetryableError(err) {
  return _isServerError(err) || _isTimeoutError(err);
}

function _isServerError(err) {
  return err && err.statusCode >= 500;
}

function _isTimeoutError(err) {
  return err && err.name === "RequestError";
}

function _retryWait(retryAttemptNumber) {
  // TODO - refine this value
  let retryDurationMillis = 1000 * 1.5 ** retryAttemptNumber;

  return new Promise(resolve => setTimeout(resolve, retryDurationMillis));
}
