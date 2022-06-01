/**
 * Author: Chris Nosowsky
 *
 * Angular version of a comment
 * */
export interface Comment {
  uid: string
  mediaID: number
  commentID?: number
  description?: string
  queued?: boolean
  createdAt?: Date
  ThreadedComments?: Comment[]
  parentId?: number
}
