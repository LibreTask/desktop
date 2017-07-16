/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

const STYLES = {
  mainColor: "#3436a5",
  linkColor: "#19198C",
  hoverColor: "#615FFE",
  buttonColor: "#eaebed", // minutely off-white
  selectedSidebarLinkColor: "#ddddf1",
  mainWindow: {
    color: "#000000",
    width: "85%",
    margin: "auto"
  },
  centeredWindow: {
    margin: "auto",
    width: "100%",
    minWidth: "300px"
  },
  centeredElement: {
    margin: "auto",
    width: "100%",
    minWidth: "300px"
  },
  dialog: {
    zIndex: 999999999 // dialogs have precedence over everything
  },
  errorText: {
    color: "red",
    marginTop: 10,
    marginBottom: 10
  }
};

module.exports = STYLES;
