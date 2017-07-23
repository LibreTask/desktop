/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

// TODO - how to properly create DB and share across all storage adapters?

import PouchDB from "pouchdb-browser";
PouchDB.plugin(require("pouchdb-upsert"));

let db = new PouchDB("./endoradb", { adapter: "websql" });

function _endoraFormat(profile) {
  let endoraFormattedProfile = {};

  if (profile) {
    endoraFormattedProfile = profile;
    delete endoraFormattedProfile._id;
    delete endoraFormattedProfile._rev;
    delete endoraFormattedProfile.type;
  }

  return endoraFormattedProfile;
}

export function queueProfileUpdate(profile) {
  // TODO - use encrypted storage for confidential information

  return db.upsert("queue/profile", function(doc) {
    profile._id = "queue/profile"; // there is only one profile active a time
    profile.type = "queue/profile"; // type helps differentiates between objects

    return profile;
  });
}

export function deletedQueuedProfile() {
  return db.get("queue/profile").then(function(profile) {
    return db.remove(profile);
  });
}

export async function getQueuedProfile() {
  return _endoraFormat(await db.get("queue/profile"));
}

export function createOrUpdateProfile(profile) {
  console.log("createOrUpdateProfile");

  console.dir(db);

  // TODO - use encrypted storage for confidential information

  return db.upsert("profile", function(doc) {
    profile._id = "profile"; // there is only one profile active a time
    profile.type = "profile"; // type helps differentiates between all objects

    return profile;
  });
}

export function deleteProfile() {
  return cleanProfileStorage();
}

export async function getMyProfile() {
  return _endoraFormat(await db.get("profile"));
}

export function logout() {
  return cleanProfileStorage();
}

export async function isLoggedIn() {
  // TODO - refine this approach

  let profile = await getMyProfile();

  return (
    profile !== null && profile !== undefined && Object.keys(profile) !== 0
  );
}

export function cleanProfileStorage() {
  // for security purposes, remove everything
  return db.destroy().then(function(response) {
    // and then recreate the database, in case the user wants to
    // log in again or perform other actions
    db = new PouchDB("./endoradb", { adapter: "websql" });
  });
}
