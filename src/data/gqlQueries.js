import { gql } from './api'

export async function getUser() {
  const response = await gql(`{
    user {
      ${userFields}
    }
  }`)

  return response.user || {}
}

export async function updateNickname(nickname) {
  const response = await gql(`
    mutation {
      updateUser(input: {
        nickname: ${json(nickname)}
      })
      {
        ${userFields}
      }
    }
  `)

  return response.updateUser || {}
}

export async function updateProfilePic(id) {
  const response = await gql(`
    mutation {
      updateUser(input: {
        photoID: ${json(id)}
      })
      {
        ${userFields}
      }
    }
  `)

  return response.updateUser || {}
}

export async function getRequests() {
  const response = await gql(`{
    posts {
      ${postFields}
    }
  }`)

  return response.posts || []
}

export async function createRequest(request) {
  const response = await gql(`
    mutation {
      createPost(input: {
        description: ${json(request.description || '')},
        destination: {
          country: ${json(request.destination.country)}
          description: ${json(request.destination.description)},
          latitude: ${json(request.destination.latitude)},
          longitude: ${json(request.destination.longitude)},
        },
        orgID: ${json(request.orgID)},
        photoID: ${json(request.photoID || '')},
        size: ${request.size}
        title: ${json(request.title)},
        type: REQUEST,
      }) 
      {
        ${postFields}
      }
    }
  `)

  return response.createPost || {}
}

export async function updateRequest(request) {
  const response = await gql(`
    mutation {
      updatePost(input: {
        description: ${json(request.description || '')},
        id: ${json(request.id)},
        photoID: ${json(request.photoID || '')},
        size: ${request.size}
        title: ${json(request.title)},
      }) 
      {
        ${postFields}
      }
    }
  `)

  return response.updatePost || {}
}

export const cancelRequest = async requestId => updateRequestStatus(requestId, 'REMOVED')
export const acceptCommittment = async requestId => updateRequestStatus(requestId, 'ACCEPTED')
export const commitToProvide = async requestId => updateRequestStatus(requestId, 'COMMITTED')
export const delivered = async requestId => updateRequestStatus(requestId, 'DELIVERED')
export const received = async requestId => updateRequestStatus(requestId, 'COMPLETED')

async function updateRequestStatus(id, status) {
  const response = await gql(`
    mutation {
      updatePostStatus(
        input: {
          id: ${json(id)},
          status: ${status}
        }
      ) 
      {
        ${postFields}
      }
    }
  `)

  return response.updatePostStatus || {}
}

export async function getMyConversations() {
  const response = await gql(`{
    myThreads {
      ${threadFields}
    }
  }`)

  return response.myThreads || []
}

export async function sendMessage(message, conversation) {
  const response = await gql(`
    mutation {
      createMessage(input: {
        content: ${json(message)},
        postID: ${json(conversation.post.id || '')}
        threadID: ${json(conversation.id || '')},
      }) 
      {
        thread {
          ${threadFields}
        }    
      }
    }
  `)

  return response.createMessage && response.createMessage.thread || { thread: {}}
}

export async function markMessagesAsRead(threadId) {
  const response = await gql(`
    mutation {
      setThreadLastViewedAt(input: {
        threadID: ${json(threadId || '')},
        time: ${json(new Date().toISOString())}
      }) 
      {
        ${threadFields}
      }
    }
  `)

  return response.setThreadLastViewedAt || {}
}

const json = JSON.stringify

const userFields = `
  avatarURL
  email
  id
  nickname
  organizations {
    id
    name
  }
`

const postFields = `
  createdBy {
    avatarURL
    id
    nickname
  }
  description
  destination {
    description
  }
  id
  organization {
    name
  }
  photo {
    url
  }
  provider {
    id
    nickname
  }
  receiver {
    nickname
  }
  size
  status
  title
`
const messageFields = `
  content
  createdAt
  id
  sender {
    id
    nickname
  }
`
const threadFields = `
  id
  messages {
    ${messageFields}
  }
  participants {
    id
    nickname
  }
  post {
    ${postFields}
  }
  unreadMessageCount
`
