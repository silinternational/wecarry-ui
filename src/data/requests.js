import { GET, POST, PUT } from './api'
import { onClear } from './storage'
import { writable } from 'svelte/store'

export const requests = writable([])
export const loading = writable(false)

let intervalId = 0

export function init() {
  const EVERY_10_MINUTES = 60 * 1000 * 10
  intervalId = setInterval(loadRequests, EVERY_10_MINUTES)

  loadRequests()

  onClear(reset)
}

async function loadRequests() {
  try {
    loading.set(true)

    const currentRequests = await GET('requests')

    requests.set(currentRequests)
  } catch (e) {
    clearInterval(intervalId)

    throw e
  } finally {
    loading.set(false)
  }
}

export async function getOneRequest(id) {
  try {
    loading.set(true)

    return await GET(`requests/${id}`)
  } catch (e) {
    throw e
  } finally {
    loading.set(false)
  }
}

export async function create(request) {
  const newRequest = await POST('requests', request)

  requests.update(currentRequests => [newRequest, ...currentRequests])
}

export async function update(request) {
  request.photo_id = request.photo?.id
  const updatedRequest = await PUT(`requests/${request.id}`, request)

  requests.update(currentRequests => {
    const i = currentRequests.findIndex(({ id }) => id === updatedRequest.id)
    if (i >= 0) {
      currentRequests[i] = updatedRequest
    }

    return currentRequests
  })
}

export async function cancel(requestId) {
  await PUT(`requests/${requestId}`, {status: 'REMOVED'})

  requests.update(currentRequests => currentRequests.filter(({id}) => id !== requestId))
}

export async function offer(requestId) {
  const updatedRequest = await POST(`requests/${requestId}/potentialprovider`)

  updateLocalRequests(updatedRequest)

  return updatedRequest
}

export async function accept(requestId, potentialProviderId) {
  const updatedRequest = await PUT(`requests/${requestId}/status`, {status: 'ACCEPTED', provider_user_id: potentialProviderId})

  updateLocalRequests(updatedRequest)

  return updatedRequest
}

export async function deliver(requestId) {
  const updatedRequest = await PUT(`requests/${requestId}/status`, {status: 'DELIVERED'})

  updateLocalRequests(updatedRequest)

  return updatedRequest
}

export async function receive(requestId) {
  const updatedRequest = await PUT(`requests/${requestId}/status`, {status: 'COMPLETED'})

  updateLocalRequests(updatedRequest)

  return updatedRequest
}

const updateLocalRequests = updatedRequest => {
  requests.update(currentRequests => {
    const i = currentRequests.findIndex(({ id }) => id === updatedRequest.id)
    if (i >= 0) {
      currentRequests[i] = updatedRequest
    }

    return currentRequests
  })
}

function reset() {
  requests.set([])
  loading.set(false)
}
