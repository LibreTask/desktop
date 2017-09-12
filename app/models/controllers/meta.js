/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import { invoke, constructAuthHeader } from "../../middleware/api";

export const canAccessNetwork = profile => {
  let today = new Date();

  return (
    profile &&
    profile.currentPlan === "premium" &&
    new Date(profile.planExpirationDateTimeUtc) > today
  );
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
