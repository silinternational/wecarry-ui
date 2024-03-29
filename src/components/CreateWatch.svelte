<script>
import FilterTag from 'components/FilterTag.svelte'
import { createdWatch } from 'data/analytics.js'
import { getActiveFilterKeys } from 'data/filtering.js'
import { getFiltersForWatch, getWatchableKeys, create } from 'data/watch.js'

import Icon from 'fa-svelte'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import jquery from 'jquery' // $ is already a reserved token in Svelte (stores)
import { goto } from '@roxi/routify'
import { onMount } from 'svelte'

export let filter

let validationError = false
let name = ''
let submitted = false

async function onSubmit() {
  if (!name) {
      validationError = true
      return
  }

  await create(name, filter)

  createdWatch()
  submitted = true
}

onMount(() => {
    jquery('#createWatchModal').on('hidden.bs.modal', function (e) {
        name = ''
        submitted = false
    })
});

$: canWatch = getWatchableKeys(getActiveFilterKeys(filter)).length
$: watchFilters = getFiltersForWatch(filter)

</script>
{#if canWatch}
  <button class={$$props.class} data-toggle="modal" data-target="#createWatchModal">
      <Icon icon={faBell} class="mr-2" />Create alert
  </button>

  <div class="modal fade" id="createWatchModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header bg-primary">
            <h4 class="modal-title text-white">Create an alert</h4>
            <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true" class="align-text-top">×</span>
            </button>
        </div>
        {#if !submitted}
          <form on:submit|preventDefault={onSubmit}>
            <div class="modal-body">
              <div class="form-group">
                <div>
                  <div class="col-form-label">
                    Alert settings:
                  </div>
                </div>
                {#each watchFilters as watchFilter}
                  <FilterTag label="{watchFilter.label}" hideCloseButton />
                {/each}
              </div>
              <div class="form-group">
                <label class="col-form-label" for="watch-name">Provide a descriptive name:</label>
                <input id="watch-name" type="text" class="form-control" bind:value={name}>
                {#if validationError}
                  <span class="form-text text-danger ml-1">Required</span>
                {/if}
              </div>
            </div>
            <div class="modal-footer justify-content-between">
              <button type="button" class="btn btn-outline-dark" data-dismiss="modal" tabindex="-1">Close</button>
              <button type="submit" class="btn btn-primary">Create alert</button>
            </div>
          </form>
        {:else}
          <div class="modal-body text-center">
            <span>Alert was created successfully.  You can find all of your <a href="/profile" on:click={() => $goto('/profile')} data-dismiss="modal">saved alerts</a> in your profile.</span>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" data-dismiss="modal">Close</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
