/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
export interface User {
  uid: string,
  firstName?: string,
  lastName?: string,
  email?: string,
  employmentStatus?: string,
  company?: string,
  roleCode?: number,
  jobRoleCode?: string,
  jobGroup?: string,
  occupationTitle?: string,
  department?: string,
  locationCode?: string,
  costcenter?: string,
  costcenterdesc?: string,
  createdAt: Date,
  updatedAt: Date
}
