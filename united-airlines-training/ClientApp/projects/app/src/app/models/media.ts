/**
 * Author: Shawn Pryde
 * 
 * Angular version of a media item
 * (to avoid complications with inheritance, all
 * media items are mapped to this type,
 * unused values are left null)
 * */
export interface Media {
  mediaStatus?: string
  mediaID?: number
  title?: string
  description?: string
  thumbnailPath?: string
  createdAt?: Date
  path?: string
  mediaTypeID?: number
  mediaTypeName?: string
  flaggedAllUsers?: boolean
  flaggedLocations?: string
  flaggedJobCodes?: string
  flaggedDepartments?: string
  flaggedJobGroups?: string
  flaggedCostCenters?: string
  commentingEnabled?: boolean
  checked?: boolean
}
