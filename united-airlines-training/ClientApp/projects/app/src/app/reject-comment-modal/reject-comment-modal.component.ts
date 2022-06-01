import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Comment } from '../models/comment';
import { CommentReasonForRejection } from '../models/CommentReasonForRejection';
import { Media } from '../models/media';
import { CommentService } from '../services/comment.service';
import { MediaService } from '../services/media.service';

@Component({
  selector: 'app-reject-comment-modal',
  templateUrl: './reject-comment-modal.component.html',
  styleUrls: ['./reject-comment-modal.component.css']
})
export class RejectCommentModalComponent implements OnInit {

  comment: Comment
  media: Media;
  reasonsForRejection: CommentReasonForRejection[];
  formComplete: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<RejectCommentModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _commentService: CommentService,
  ) {
    this.comment = data.comment;
    this.media = data.mediaItem;
  }

  ngOnInit(): void {
    this._commentService.getCommentReasonsForRejection().subscribe(reasons => {
      this.reasonsForRejection = reasons;
    })
  }

  submit() {
    let dropdown: HTMLSelectElement = document.querySelector("#rejectionDropdown");
    let textarea: HTMLTextAreaElement = document.querySelector("#optionalAdditionalInfo");
    let response = {
      confirmed: true,
      comment: this.comment,
      reasonForRejection: dropdown.value,
      additionalInformation: textarea.value
    }
    this.dialogRef.close(response);

  }

  cancel() {
    let response = {
      confirmed: false,
      comment: this.comment
    }
    this.dialogRef.close(response);
  }

  convertUTCDateToLocalDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toDateString();
  }

  onDropdownSelect(val: string) {
    this.formComplete = val != "" && val != null;
  }

}
