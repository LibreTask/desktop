/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/desktop/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from "../../middleware/api";

export const canAccessNetwork = profile => {
  return profile && profile.id && profile.password;
};

export const getLatestVersion = () => {
  const platform =
    process.platform === "darwin" ? "desktop-mac" : "desktop-windows";

  // TODO - cover linux here as well

  const request = {
    endpoint: `meta/get-latest-version/platform=${platform}`,
    method: "get",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  };

  return invoke(request);
};
