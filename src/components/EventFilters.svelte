<script>
import LocationFilter from 'components/LocationFilter.svelte'
import SearchFilter from 'components/SearchFilter.svelte'
import ToggleFilter from 'components/ToggleFilter.svelte'
import { filteredMeetingsByAll, filteredMeetingsByLocation, filteredMeetingsByMine, searchedMeetings } from 'data/analytics.js'
import { clearEventFilter } from 'data/eventFiltering.js'
import { removeFilter, setFilters } from 'data/filtering.js'

import { goto } from '@roxi/routify'

export let filter = {}

$: location = {description: filter.location.value}
$: onlyMyEvents = filter.participating.active
$: searchText = filter.search.value || ''

function onKeywordInput(event) {
  const query = event.detail
  $goto(setFilters({ search: query }))

  searchedMeetings(query)
}

function onLocationChange(event) {
  const query = event.detail && event.detail.description
  $goto(setFilters({ location: query }))

  filteredMeetingsByLocation(query)
}

function onMyEventsChange(event) {
  if (event.detail) {
    $goto(setFilters({ participating: null }))

    filteredMeetingsByMine()
  } else {
    $goto(removeFilter('participating'))
  }
}

function resetFilters() {
  $goto(clearEventFilter())

  filteredMeetingsByAll()
}
</script>

<div class="card border-bottom"><!-- Note: Remove "border-bottom" if another card is added. -->
  <div class="card-header d-flex flex-row justify-content-between align-items-center">
      Filters
      <button on:click={resetFilters} class="btn btn-link p-0"><small>clear filters</small></button>
  </div>

  <div class="card-body">
    <ToggleFilter on:change={onMyEventsChange} active={onlyMyEvents} label="Only my events" />
    <hr />
    <LocationFilter title="Event location" {location} on:change={onLocationChange} />
    <hr />
    <SearchFilter title="Keyword" value={searchText} on:input={onKeywordInput} />
  </div>
</div>
