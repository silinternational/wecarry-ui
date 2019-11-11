import { gql } from './api'

const json = JSON.stringify

export function getUser() {
  return gql(`{
    user {
      id
      email
      nickname
      photoURL
      organizations {
        id
        name
      }
    }
  }`)
}

export function getRequests() {
  return gql(`{
    posts {
      id
      title
      destination {
        description
      }
      createdBy {
        id
        nickname
        photoURL
      }
      provider {
        id
      }
      neededAfter
      neededBefore
      category
      size
      photo {
        url
      }
    }
  }`)
}

export function getRequest(id) {
  return gql(`{
    post(id: ${json(id)}) {
      id
      title
      description
      destination {
        description
      }
      url
      size
      photo {
        url
      }
      createdBy {
        id
        nickname
      }
      receiver {
        nickname
      }
      provider {
        id
        nickname
      }
      organization {
        name
      }
      threads {
        id
        participants {
          id
          nickname
        }
        post {
          id
          title
          createdBy {
            id
            nickname
          }
          destination {
            description
          }
          status
          neededAfter
          neededBefore
          provider {
            id
            nickname
          }
        }
        messages {
          createdAt
          sender {
            id
            nickname
          }
          content
        }
      }
    }
  }`)
}

export function getMyRequests() {
  return gql(`{
    user {
      posts(role: CREATEDBY) {
        id
        status
        title
        description
        destination {
          description
        }
        neededAfter
        neededBefore
        provider {
          nickname
        }
      }
    }
  }`)
}

export function getMyCommitments() {
  return gql(`{
    user {
      posts(role: PROVIDING) {
        title
        description
        destination {
          description
        }
        neededAfter
        neededBefore
        provider {
          nickname
        }
      }
    }
  }`)
}

export function createPost(post) {
  return gql(`
    mutation {
      createPost(input: {
        orgID: ${json(post.orgID)},
        type: ${post.type},
        title: ${json(post.title)},
        description: ${json(post.description || '')},
        destination: {
          description: ${json(post.destination.description)},
          latitude: ${json(post.destination.latitude)},
          longitude: ${json(post.destination.longitude)},
          country: ${json(post.destination.country)}
        },
        photoID: ${json(post.photoID)},
        size: ${post.size}
      }) 
      {
        title
      }
    }
  `)
}

export function sendCommit(postId) {
  return gql(`
    mutation {
      updatePost(
        input: {
          id: ${json(postId)},
          status: COMMITTED
        }
      ) 
      {
        id
        status
        title
        createdBy {
          id
          nickname
        }
        destination {
          description
        }
        neededAfter
        neededBefore
        provider {
          id
          nickname
        }
      }
    }
  `)
}

export function acceptCommittment(postId) {
  return gql(`
    mutation {
      updatePost(
        input: {
          id: ${json(postId)},
          status: ACCEPTED
        }
      ) 
      {
        id
        status
        title
        createdBy {
          id
          nickname
        }
        destination {
          description
        }
        neededAfter
        neededBefore
        provider {
          id
          nickname
        }
      }
    }
  `)
}

export function confirmReceipt(postId) {
  return gql(`
    mutation {
      updatePost(
        input: {
          id: ${json(postId)},
          status: RECEIVED
        }
      ) 
      {
        id
      }
    }
  `)
}

export function cancelPost(postId) {
  return gql(`
    mutation {
      updatePost(
        input: {
          id: ${json(postId)},
          status: REMOVED
        }
      ) 
      {
        id
      }
    }
  `)
}

export function getMyConversations() {
  return gql(`{
    myThreads {
      id
      participants {
        id
        nickname
      }
      post {
        id
        status
        title
        createdBy {
          id
          nickname
        }
        destination {
          description
        }
        neededAfter
        neededBefore
        provider {
          id
          nickname
        }
      }
      messages {
        id
        createdAt
        sender {
          id
          nickname
        }
        content
      }
      unreadMessageCount
    }
  }`)
}

export function sendMessage(message, conversation) {
  return gql(`
    mutation {
      createMessage(input: {
        content: ${json(message)},
        threadID: ${json(conversation.id || '')},
        postID: ${json(conversation.post.id || '')}
      }) 
      {
        thread {
          id
          participants {
            id
            nickname
          }
          post {
            id
            status
            title
            createdBy {
              id
              nickname
            }
            destination {
              description
            }
            neededAfter
            neededBefore
            provider {
              id
              nickname
            }
          }
          messages {
            id
            createdAt
            sender {
              id
              nickname
            }
            content
          }
        }    
      }
    }
  `)
}

export function markMessagesAsRead(threadId) {
  return gql(`
    mutation {
      setThreadLastViewedAt(input: {
        threadID: ${json(threadId || '')},
        time: ${json(new Date().toISOString())}
      }) 
      {
        id
        unreadMessageCount
      }
    }
  `)
}
