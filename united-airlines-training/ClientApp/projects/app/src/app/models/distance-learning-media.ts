import { DistanceLearningSession } from './distance-learning-session';
import { DistanceLearningAttendanceRequirement } from './DistanceLearningAttendanceRequirement';

export interface DistanceLearningMedia {
  mediaId: number,
  instructions: string,
  sessions?: DistanceLearningSession[],
  attendanceRequirements?: DistanceLearningAttendanceRequirement[]
}
