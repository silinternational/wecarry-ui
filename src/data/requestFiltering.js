import { getSelectedSizes } from '../data/sizes'
import { updateQueryString } from '../data/url'

export function populateFilterFrom(queryStringData) {
  return {
    createdBy: { id: queryStringData.creator },
    provider: { id: queryStringData.provider },
    size: getSelectedSizes(String(queryStringData.size).toUpperCase()),
  }
}

/** NOTE: This should clear all values used by `populateFilterFrom()` */
export function clearFilter(location, queryString) {
  updateQueryString(location, queryString, {
    creator: null,
    provider: null,
    size: null,
  })
}

export function filterRequests(requests, requestFilter, searchText) {
  let results = requests.slice(0); // Shallow-clone the array quickly.

  for (const property in requestFilter) {
    results = results.filter(request => matchesProperty(request, requestFilter, property))
  }

  if (searchText) {
    results = results.filter(request => matchesSearchText(request, searchText))
  }

  return results
}

function matchesProperty(request, requestFilter, property) {
  if (!requestFilter[property]) {
    return true
  }

  if (!request) {
    return false
  }

  if (Array.isArray(requestFilter[property])) {
    return (requestFilter[property].indexOf(request[property]) >= 0)
  } else if (typeof requestFilter[property] === 'object') {
    for (const subProperty in requestFilter[property]) {
      if (!matchesProperty(request[property], requestFilter[property], subProperty)) {
        return false
      }
    }
    return true
  }
  return request[property] === requestFilter[property]
}

function matchesSearchText(request, searchText) {
  const lowerCaseSearchText = searchText.toLowerCase()

  return stringIsIn(lowerCaseSearchText, request.title) ||
         stringIsIn(lowerCaseSearchText, request.destination.description) ||
         stringIsIn(lowerCaseSearchText, request.createdBy.nickname)
}

function stringIsIn(needle, haystack) {
  return (haystack || '').toLowerCase().indexOf(needle) >= 0
}