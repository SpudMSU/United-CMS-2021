import { GeneralFeedback } from './general-feedback';
import { User } from './user';
import { MediaFeedback } from './media-feedback';

/*
  Author: Chris Nosowsky
  Created: 11-1-2020
*/
export interface UserFeedbackData {
  gFeedback?: GeneralFeedback
  mFeedback?: MediaFeedback
  uFeedback: User
  phone?: string
  mediatitle?: string
  subject?: string
}
