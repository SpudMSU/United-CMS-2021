export interface AdminAuditLog {
  id?: number,
  category: string,
  item: string,
  change: string,
  username: string,
  userRole: string,
  changeDate: Date,
  mediaID: number,
  reverted?: boolean
        
}
