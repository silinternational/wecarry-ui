import { filterItems, stringIsIn } from './filtering'
import { updateQueryString } from './url'

export function populateEventFilterFrom(queryStringData) {
  return {
    search: queryStringData.search,
  }
}

/** NOTE: This should clear all values used by `populateFilterFrom()` */
export function clearEventFilter() {
  updateQueryString({
    search: null,
  })
}

export function filterEvents(events, filter) {
  return filterItems(events, filter, eventMatchesSearchText)
}

function eventMatchesSearchText(event, searchText) {
  return stringIsIn(searchText, event.name)
}