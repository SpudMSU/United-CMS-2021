import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { DistanceLearningSession } from '../../models/distance-learning-session';
import { MediaService } from '../../services/media.service';

@Component({
  selector: 'app-edit-session-modal',
  templateUrl: './edit-session-modal.component.html',
  styleUrls: ['./edit-session-modal.component.css']
})
export class EditSessionModalComponent implements OnInit {
  session: DistanceLearningSession;

  url: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  passwordProtected: boolean;
  password: string;

  constructor(
    public dialogRef: MatDialogRef<EditSessionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mediaService: MediaService
  ) {
    this.session = data.session;
    this.url = this.session.urlPath;

    let startDate = new Date(this.session.startTime + "Z");
    this.startDate = this.formatDate(startDate);
    this.startTime = this.formatTime(startDate);

    let endDate = new Date(this.session.endTime + "Z");
    this.endDate = this.formatDate(endDate);
    this.endTime = this.formatTime(endDate);

    this.passwordProtected = this.session.isPasswordProtected;
    if (this.passwordProtected) {
      this.password = this.session.password;
    }

  }

  ngOnInit(): void {

  }

  formatDate(date: Date) {
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    let dayString = "";
    let monthString = "";
    let yearString = year.toString();

    month < 10 ? monthString = "0" + month.toString() : monthString = month.toString();
    day < 10 ? dayString = "0" + day.toString() : dayString = day.toString();

    return yearString + "-" + monthString + "-" + dayString;
  }

  formatTime(date: Date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    let minutesString = "";
    let hourString = "";

    minutes < 10 ? minutesString = "0" + minutes.toString() : minutesString = minutes.toString();
    hours < 10 ? hourString = "0" + hours.toString() : hourString = hours.toString();

    return hourString + ":" + minutesString;
  }

  submit() {
    let newSession: DistanceLearningSession = {
      id: this.session.id,
      mediaID: this.session.mediaID,
      urlPath: this.url,
      startTime: new Date(this.startDate + "T" + this.startTime + ":00"),
      endTime: new Date(this.endDate + "T" + this.endTime + ":00"),
      isPasswordProtected: this.passwordProtected,
      password: this.passwordProtected ? this.password : null
    }
    this.mediaService.updateDistanceLearningSession(this.session.id, newSession).subscribe(updatedSession => {
      //updatedSession.startTime = new Date(updatedSession.startTime + "Z");
      //updatedSession.endTime = new Date(updatedSession.endTime + "Z");
      let response = {
        submitted: true,
        session: updatedSession
      }
      
      this.dialogRef.close(response);
    })

  }

  delete() {
    let response = {
      submitted: true,
      session: null
    }
    this.dialogRef.close(response);
  }

  cancel() {
    let response = {
      submitted: false,
      session: this.session
    }
    this.dialogRef.close(response);
  }

}
