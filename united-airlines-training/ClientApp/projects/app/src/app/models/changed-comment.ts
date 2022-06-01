export interface ChangedComment {
  changeID: number
  uID?: string
  mediaID?: number
  commentID?: number
  description?: string
  queued?: boolean
  createdAt?: Date
  parentId?: number
  ThreadedComments?: Comment[]
}
