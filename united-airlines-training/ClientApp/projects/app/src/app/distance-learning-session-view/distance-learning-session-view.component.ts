import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import * as moment from 'moment';
import { DistanceLearningSession } from '../models/distance-learning-session';
import { MediaService } from '../services/media.service';
import { EditSessionModalComponent } from './edit-session-modal/edit-session-modal.component';

@Component({
  selector: 'app-distance-learning-session-view',
  templateUrl: './distance-learning-session-view.component.html',
  styleUrls: ['./distance-learning-session-view.component.css']
})
export class DistanceLearningSessionViewComponent implements OnInit {
  @Input() session: DistanceLearningSession;
  @Input() editable: boolean;
  @Input() linksEnabled: boolean;
  @Input() passwordViewable: boolean;

  @Output() onDelete: EventEmitter<DistanceLearningSession> = new EventEmitter<DistanceLearningSession>();

  editing: boolean = false;

  startDateString: string = "";
  endDateString: string = "";

  constructor(
    private matDialog: MatDialog,
    private mediaService: MediaService
  ) { }

  ngOnInit(): void {
    // This is incredibly dumb but you can thank json serialization not having a standard for dates
    if (typeof this.session.startTime == "string") {
      // Casts the ISO strings returned from the backend into UTC, so that when they're displayed the Javascript Date object implicitly offsets
      // by the local computer's timezone
      this.startDateString = this.convertSessionDate(this.session.startTime + "Z");
      this.endDateString = this.convertSessionDate(this.session.endTime + "Z");
    }
    else {
      // This is to account for after we add a new event and the session.startTime actually IS a Date object, instead of a string masquerading as a date object
      this.startDateString = moment(this.session.startTime).format("MMM Do, YYYY LT");
      this.endDateString = moment(this.session.endTime).format("MMM Do, YYYY LT");
    }

  }

  convertSessionDate(dateStr) {
    var date = new Date(dateStr);
    //var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    var newString = moment(date).format("MMM Do, YYYY LT");
    return newString;
  }

  onEditClicked() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = 600;
    dialogConfig.data = { session: this.session };
    this.matDialog.open(EditSessionModalComponent, dialogConfig).afterClosed().subscribe(response => {
      if (response) {
        let submitted = response['submitted'];
        if (submitted) {
          if (response['session'] != null) {
            this.session = response['session'];
            this.startDateString = moment(this.session.startTime).format("MMM Do, YYYY LT");
            this.endDateString = moment(this.session.endTime).format("MMM Do, YYYY LT");
          } else {
            this.mediaService.deleteDistanceLearningSession(this.session.id).subscribe(response => {
              this.onDelete.emit(this.session);
            })
          }
        }
      }
    })
  }


}
