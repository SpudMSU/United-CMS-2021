/**
 * Author: Shawn Pryde
 * -
 * 
 * */
export interface DistanceLearningSession {
  id: number,
  mediaID: number,
  startTime: any,
  endTime?: any,
  urlPath: string,
  isPasswordProtected?: boolean,
  password?: string
}
