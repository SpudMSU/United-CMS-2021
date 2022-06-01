export interface ChangedMedia {
  changeID: number
  mediaID?: number
  mediaStatus?: string
  title?: string
  description?: string
  thumbnailPath?: string
  mediaTypeID?: number
  path?: string
  flaggedAllUsers?: boolean
  flaggedLocations?: string
  flaggedJobCodes?: string
  flaggedDepartments?: string
  flaggedJobGroups?: string
  flaggedCostCenters?: string
  createdAt?: Date
}
