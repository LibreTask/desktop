/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/desktop/blob/master/LICENSE.md
 */

import * as _ from 'lodash'

import PouchDB from 'pouchdb-browser'
PouchDB.plugin(require('pouchdb-upsert'))

const db = new PouchDB('./endoradb', {adapter: 'websql'})

function _endoraFormat(list) {
  let endoraFormattedList = {}

  if (list) {
    endoraFormattedList = list.key
    delete endoraFormattedList._id
    delete endoraFormattedList._rev
    delete endoraFormattedList.type
  }

  return endoraFormattedList
}

export async function getListByListId(listId) {
  return _endoraFormat(await db.get(listId))
}

export async function getAllLists() {
  // TODO - look into "design doc" for map queries
  function map(doc) {

    if (doc.type === 'list') {
      emit(doc)
    }
  }

  let lists = await db.query(map)

  let listMap = {}
  for (let list of lists.rows) {
    listMap[list.id] = _endoraFormat(list)
  }

  return listMap
}

export async function getListsByUserId(userId) {
  // TODO - look into "design doc" for map queries
  function map(doc) {

    if (doc.type === 'list' && doc.userId === userId ) {
      emit(doc)
    }
  }

  let lists = await db.query(map)

  let listMap = {}
  for (let list of lists.rows) {
    listMap[list.id] = _endoraFormat(list)
  }

  return listMap
}

export function createOrUpdateLists(lists) {

  for (let list of lists) {
    createOrUpdateList(list)
  }
}

export function createOrUpdateList(list) {

  return db.upsert(list.id, function(doc) {

    list._id = list.id
    list.type = 'list'

    return list;
  })
}

export function deleteListByListId(listId) {
  // TODO - we should instead update the "deletion status"
  return db.remove(listId)
}

export function cleanListStorage() {

}
