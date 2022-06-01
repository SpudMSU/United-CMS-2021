import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DistanceLearningMedia } from '../../models/distance-learning-media';
import { DistanceLearningSession } from '../../models/distance-learning-session';
import { DistanceLearningAttendanceRequirement } from '../../models/DistanceLearningAttendanceRequirement';
import { Media } from '../../models/media';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-distance-learning-content',
  templateUrl: './distance-learning-content.component.html',
  styleUrls: ['./distance-learning-content.component.css']
})
export class DistanceLearningContentComponent implements OnInit {
  @Input() media: Media;
  @Input() editable: boolean;

  instructions: string = "";
  activeSessions: DistanceLearningSession[] = []; // Sessions that are currently viewable by the user
  hiddenSessions: DistanceLearningSession[] = []; // Sessions that are hidden from the user (must first enter password to view them)
  attendanceRequirements: DistanceLearningAttendanceRequirement[] = [];

  requirementsVerified: boolean = false;

  showPasscode: boolean = false;
  showPasscodeError: boolean = false;

  constructor(
    private _mediaService: MediaService
  ) { }

  ngOnInit(): void {
    this._mediaService.getDistanceLearningMedia(this.media.mediaID).subscribe(distanceLearningMedia => {

      this.instructions = distanceLearningMedia.instructions;
      this.attendanceRequirements = distanceLearningMedia.attendanceRequirements;

      for (let session of distanceLearningMedia.sessions) {
        session.isPasswordProtected ? this.hiddenSessions.push(session) : this.activeSessions.push(session);
      }

      this.showPasscode = this.hiddenSessions.length > 0;
    });

  }

  toggleRequirementsVerified() {
    this.requirementsVerified = !this.requirementsVerified;
  }

  onPasscodeSubmitted() {
    let inputField: HTMLInputElement = document.querySelector("#passcodeField");
    let value = inputField.value.trim().toLowerCase();

    let ind = this.hiddenSessions.findIndex(ele => ele.password.trim().toLowerCase() == value);

    if (ind == -1) {
      this.showPasscodeError = true;
    } else {
      this.showPasscodeError = false;
      while (ind != -1) {
        this.activeSessions.push(this.hiddenSessions[ind]);
        this.hiddenSessions.splice(ind, 1);

        ind = this.hiddenSessions.findIndex(ele => ele.password.trim().toLowerCase() == value);
      }
    }

    inputField.value = "";
  }

}
