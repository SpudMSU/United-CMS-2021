/**
 * Author: Shawn Pryde
 * -
 * Angular version of a channel
 * */
export interface Channel {
  channelID: number
  title: string
  description?: string
  icon?: string
  child?: Channel[]
  parentId?: number //new element
  show?: boolean
  currentClasses?: string
  level?: number
  pID?: number
}
