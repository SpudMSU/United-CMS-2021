/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
export interface Rating {
  uId: string,
  mediaID: number,
  like: boolean,
  createdAt?: Date,
}
