<script>
import OtherRequestsBy from 'components/OtherRequestsBy.svelte'
import RequestImage from 'components/RequestImage.svelte'
import RequestMessaging from 'components/RequestMessaging.svelte'
import SizeTile from 'components/SizeTile.svelte'
import UserAvatar from 'components/UserAvatar.svelte'
import WeightDisplay from 'components/WeightDisplay.svelte'
import { getOneRequest, loading } from 'data/requests.js'
import { me } from 'data/user.js'
import { describeVisibility } from 'data/visibility.js'

import { params, redirect } from '@roxi/routify'

const dlTermColumns        = 'col-12 col-md-5 col-lg-3'
const dlDescriptionColumns = 'col-12 col-md-7 col-lg-9'

let request = {}

$: conversationId = $params.conversationId
$: $params.requestId && getOneRequest($params.requestId).then(r => request = r)
$: requester = request.created_by || {}
$: isMine = $me.id && (requester.id === $me.id) // Check $me.id first to avoid `undefined === undefined`
$: destination = request.destination?.description || ''
$: origin = request.origin?.description || ''

function goToConversation(conversationId) {
  $redirect(`/requests/${$params.requestId}/conversation/${conversationId}`)
}
</script>

<style>
.mb-1dot5 {
  margin-bottom: 1.5rem;
}
.keep-line-breaks {
  white-space: pre-line;
}
.request-image-container {
  height: 160px; /* Set height inherited by request image, so it's not 0px */
  min-width: 105px;
}
.size-tile-container {
  margin-left: auto;
  margin-right: auto;
  max-width: 160px;
}
</style>

<div class="row mb-3">
  <div class="col">
    <a href="/requests" class="text-secondary mb-3">« back to requests</a>
  </div>
</div>


{#if $loading}
  <p>⏳ retrieving request...</p>
{:else if request.id}
  <div class="row">
    <div class="col-12 col-sm-4 col-lg-3">
      <div class="row">
        <div class="col col-sm-12 mb-1dot5"><div class="request-image-container"><RequestImage {request} hideSize /></div></div>
        <div class="col col-sm-12 mb-1dot5"><div class="size-tile-container"><SizeTile size={request.size} /></div></div>
      </div>
    </div>

    <div class="col">
      <div class="row">
        <div class="col">
          <h3 class="card-title">{ request.title || ''}</h3>
          <dl class="row">
            <dt class={dlTermColumns}>Deliver to</dt>
            <dd class={dlDescriptionColumns}>
              { destination }
            </dd>

            {#if request.meeting}
              <dt class={dlTermColumns}>Event</dt>
              <dd class={dlDescriptionColumns}>
                {request.meeting?.name || ''}
              </dd>
            {/if}

            <dt class={dlTermColumns}>From</dt>
            <dd class={dlDescriptionColumns}>
              {#if origin }
                { origin }
              {:else}
                <span class="font-italic">anywhere</span>
              {/if}
            </dd>

            {#if request.is_editable && request.visibility }
              <dt class={dlTermColumns}>Visible to</dt>
              <dd class={dlDescriptionColumns}>{ describeVisibility(request.visibility, [request.organization]) }</dd>
            {/if}

            {#if request.needed_before }
              <dt class={dlTermColumns}>Needed before</dt>
              <dd class={dlDescriptionColumns}>{ (new Date(request.needed_before)).toLocaleDateString([], { timeZone: 'UTC' }) }</dd>
            {/if}

            <!-- Show any actual value (including zero) -->
            {#if request.kilograms != null }
              <dt class={dlTermColumns}>Weight</dt>
              <dd class={dlDescriptionColumns}><WeightDisplay kilograms={request.kilograms} /></dd>
            {/if}
          </dl>
        </div>
        <div class="col-auto">
          <div class="text-center mb-half">
            <UserAvatar user={requester} />
            <div>{ requester.nickname || '' }</div>
          </div>
        </div>
      </div>
      <p class="mb-1dot5 keep-line-breaks">{ request.description || '' }</p>
      {#if request.is_editable}
        <a href="/requests/{request.id}/edit" class="btn btn-sm btn-outline-secondary mb-half">Edit request</a>
      {/if}
      <RequestMessaging {request} {conversationId} on:conversation-selected={event => goToConversation(event.detail)} />
      {#if !isMine }
        <OtherRequestsBy {request} {requester} />
      {/if}
    </div>
  </div>
{/if}
