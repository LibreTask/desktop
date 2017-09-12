/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

const CONSTANTS = {
  ACCOUNT_UPGRADE_LINK: "https://www.algernon.io/profile/upgrade",
  ACCOUNT_DOWNGRADE_LINK: "https://www.algernon.io/profile/downgrade",
  PASSWORD_RESET_LINK: "https://www.algernon.io/forgot-password",
  PRODUCT_PRIVACY_LINK: "https://www.algernon.io/privacy",
  PRODUCT_TERMS_LINK: "https://www.algernon.io/terms",
  WEBSITE_LINK: "https://algernon.io",
  SOURCE_CODE_LINK: "https://github.com/AlgernonLabs/mobile",

  APP_UPDATE_LINK: "https://algernon.io/apps", // TODO -

  APP_VERSION: "0.0.1", // TODO - pull from package.json instead
  APP_NAME: "Algernon",

  // TODO - move these button constants to more appropriate location
  EDIT_NAVBAR_BUTTON: "EDIT_NAVBAR_BUTTON",
  CREATE_NAVBAR_BUTTON: "CREATE_NAVBAR_BUTTON",
  DELETE_NAVBAR_BUTTON: "DELETE_NAVBAR_BUTTON",
  SAVE_NAVBAR_BUTTON: "SAVE_NAVBAR_BUTTON",
  BACK_NAVBAR_BUTTON: "BACK_NAVBAR_BUTTON",
  SETTINGS_NAV_BUTTON: "SETTINGS_NAV_BUTTON",

  INITIAL_WINDOW_HEIGHT: 420,
  INITIAL_WINDOW_WIDTH: 380,

  SYNC_INTERVAL_MILLIS: 30 * 1000, // 30 seconds
  QUEUED_TASK_SUBMISSION_INTERVAL_MILLIS: 60 * 1000, // 60 seconds
  QUEUED_PROFILE_SUBMISSION_INTERVAL_MILLIS: 60 * 1000, // 60 seconds
  TASK_CLEANUP_INTERVAL_MILLIS: 60 * 1000 * 60 * 24, // one day

  // check each minute whether the taskview should be updated
  // note this is primarily used to update the TaskView at midnight
  TASKVIEW_REFRESH_CHECK_INTERVAL_MILLIS: 60 * 1000
};

module.exports = CONSTANTS;
