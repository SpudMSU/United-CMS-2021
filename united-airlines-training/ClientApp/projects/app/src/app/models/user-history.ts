/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
export interface UserHistory {
  uId?: string,
  mediaId: number,
  watchLength: number,
  clickedAmount: number,
  createdAt?: Date,
  completeView: boolean,
  updatedAt: Date
}
