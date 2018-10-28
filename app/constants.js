/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

const CONSTANTS = {
  ACCOUNT_UPGRADE_LINK: "https://libretask.org/profile/upgrade",
  ACCOUNT_DOWNGRADE_LINK: "https://libretask.org/profile/downgrade",
  PASSWORD_RESET_LINK: "https://libretask.org/forgot-password",
  PRODUCT_PRIVACY_LINK: "https://libretask.org/privacy",
  PRODUCT_TERMS_LINK: "https://libretask.org/terms",
  WEBSITE_LINK: "https://libretask.org",
  SOURCE_CODE_LINK: "https://github.com/LibreTask/desktop",

  APP_UPDATE_LINK: "https://libretask.org/apps", // TODO -

  APP_VERSION: "0.0.1", // TODO - pull from package.json instead
  APP_NAME: "LibreTask",

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
