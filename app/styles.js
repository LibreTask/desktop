/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
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
  },
  progressSpinner: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    zIndex: 100000000, // spinners should have precedence
    margin: "auto"
  },
  loadingOpacity: 0.6
};

module.exports = STYLES;
