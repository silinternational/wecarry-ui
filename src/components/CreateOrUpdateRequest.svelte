<script>
import DeleteRequestModal from 'components/DeleteRequestModal.svelte'
import EventSelect from 'components/EventSelect.svelte'
import LocationInput from 'components/LocationInput.svelte'
import SizeSelector from 'components/SizeSelector.svelte'
import VisibilitySelector from 'components/VisibilitySelector.svelte'
import Uploader from 'components/Uploader.svelte'
import WeightSelector from 'components/WeightSelector.svelte'
import { updated, created, cancelled } from 'data/analytics.js'
import { throwError } from 'data/error.js'
import { events } from 'data/events.js'
import { requests, cancel, create, update } from 'data/requests.js'
import { me } from 'data/user.js'

import { format, addDays } from 'date-fns'
import Icon from 'fa-svelte'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { goto, params } from '@roxi/routify'

let imageUrl = ''
let eventId = ''
let deleteModalOpen = false

const defaults = {

  title: '',
  description: '',
  visibility: 'SAME'
}
let request = {}
const tomorrow = format(addDays(Date.now(), 1), 'yyyy-MM-dd')

$: existingRequest = $requests.find(({ id }) => id === $params.requestId)
$: initializeUpdates(existingRequest || defaults)
$: isNew = !request.id
$: eventId = existingRequest?.meeting?.id
$: if ($me.organizations && $me.organizations.length > 0) {
  request.viewableBy = $me.organizations[0].id
}
$: myEvents = $events?.filter(e => e.has_joined) || []

function initializeUpdates(requestBeingEdited) {
  request = Object.assign({}, requestBeingEdited)
}

function assertHas(value, errorMessage) {
  if (!value) {
    throwError(errorMessage)
  }
}

function validate(request) {
  assertHas(request.title, 'Please tell us what you are requesting')
  assertHas(request.destination, 'Please provide a destination')
  assertHas(request.size, 'Please tell us the size of the item you are requesting')
}

async function onSubmit() {
  validate(request)

  if (isNew) {
    await create(request)

    $goto(`/requests`)

    created()
  } else {
    await update(request)

    $goto(`/requests/${request.id}`)

    updated()
  }
}

function imageUploaded(event) {
  request.photo = event.detail
  imageUrl = event.detail.url
}

async function cancelRequest() {
  deleteModalOpen = false

  await cancel($params.requestId)

  $goto(`/requests`)

  cancelled()
}

function onEventChange(e) {
  request.event_id = e.detail
  request.destination = $events.find(({ id }) => id === e.detail).location
}

function onDestinationChanged(event) {
  request.destination = event.detail
  request.event_id = null
}

function onOriginChanged(event) {
  request.origin = event.detail
}

function OnVisibilityChanged(event) {
  request.visibility = event.detail
}

function onWeightChanged(event) {
  request.kilograms = event.detail
}
</script>

<style>
.preview {
  max-height: 160px;
}
</style>

<h2 class="mb-3">Make a Request</h2>

<form on:submit|preventDefault={onSubmit} autocomplete="off">
  <div class="form-row form-group">
    <label for="request-title" class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      Requesting:
    </label>


    <div class="col">
      <input type="text" class="form-control form-control-lg" id="request-title" bind:value={request.title} placeholder="What?">
    </div>
  </div>

  <div class="form-row form-group">
    <span class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      To:
    </span>

    <div class="col">
      <div class="form-group">
        {#if myEvents.length}
          Select a location:
        {/if}
        <LocationInput class="form-control form-control-lg" on:change={onDestinationChanged}
                       placeholder="Destination" location={request.destination} />
        {#if myEvents.length}
          Or choose an event:
          <EventSelect class="form-control form-control-lg" events={myEvents} {eventId} on:change={onEventChange} />
        {/if}
      </div>
    </div>
  </div>

  <div class="form-row form-group">
    <span class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      From: <br />
      <small class="text-muted font-italic">(optional)</small>
    </span>

    <div class="col">
      <div class="form-group">
        <LocationInput class="form-control form-control-lg" on:change={onOriginChanged}
                       placeholder="Origin" location={request.origin} />
      </div>
    </div>
  </div>

  <div class="form-row form-group">
    <div class="col-12 col-md-3 col-lg-2 col-form-label-lg">Size: </div>
    <div class="col"><SizeSelector bind:selectedName={request.size} /></div>
  </div>

  <div class="form-row form-group">
    <div class="col-12 col-md-3 col-lg-2 col-form-label-lg">
      Weight:<br />
      <small class="text-muted font-italic">(optional)</small>
    </div>
    <div class="col"><WeightSelector on:change={onWeightChanged} kilograms={request.kilograms} /></div>
  </div>

  <div class="form-row form-group">
    <div class="col-auto col-sm-3 col-lg-2 col-form-label-lg">
      Upload image: <br />
      <small class="text-muted font-italic">(optional)</small>
    </div>

    <div class="col-auto mt-1">
      <Uploader on:uploaded={imageUploaded} type={ request.photo && request.photo.url ? 'change' : 'add'}/>
    </div>

    {#if imageUrl || request.photo && request.photo.url}
      <div class="col-12 col-sm-5 text-center text-sm-left">
        <img src={imageUrl || request.photo && request.photo.url} alt="Request details" class="preview" />
      </div>
    {/if}
  </div>

  <div class="form-row form-group">
    <div class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      <label for="request-description">Description:</label>
    </div>
    <div class="col">
      <textarea class="form-control" bind:value={request.description} rows="3"
                id="request-description" placeholder="Please describe the item" />
    </div>
  </div>

  <div class="form-row form-group">
    <div class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      <span>
        Visibility:<br />
        <small class="text-muted font-italic">(Who can see this request)</small>
      </span>
    </div>
    <div class="col p-half">
      <VisibilitySelector on:change={OnVisibilityChanged} visibility={request.visibility} />
    </div>
  </div>

  <div class="form-row form-group">
    <div class="col-12 col-sm-3 col-lg-2 col-form-label-lg">
      <label for="request-needed-before">
        Needed before:<br />
        <small class="text-muted font-italic">(optional)</small>
      </label>
    </div>
    <div class="col-auto">
      <input type="date" class="form-control form-control-lg" id="request-needed-before" min={tomorrow} bind:value={request.needed_before} />
    </div>
  </div>

  <div class="form-row form-group">
    <div class="col-auto">
      <a href="/requests" on:click|preventDefault={() => history.back()} class="btn btn-outline-dark">« Cancel</a>
    </div>
    <div class="col"></div>

    {#if !isNew}
      <div class="col-auto text-center">
        <button type="button" on:click={() => (deleteModalOpen = true)} class="btn btn-outline-danger">
          <Icon icon={faTrash} /> Delete
        </button>
      </div>
      <div class="col"></div>
    {/if}

    <DeleteRequestModal on:delete={cancelRequest} on:closed={() => (deleteModalOpen = false)} on:cancel={() => (deleteModalOpen = false)} open={deleteModalOpen} />

    <div class="col-auto">
      <button type="submit" class="btn btn-primary float-right">
        {#if isNew}
          Make request
        {:else}
          Update request
        {/if}
      </button>
    </div>
  </div>
</form>
