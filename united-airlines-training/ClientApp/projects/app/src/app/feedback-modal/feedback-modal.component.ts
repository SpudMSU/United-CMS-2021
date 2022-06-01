/*
  Author: Chris Nosowsky
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Media } from '../models/media';

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent implements OnInit {

  mediaFeedback: boolean = true;

/**
* Constructor initializes all services used, including the data that gets injected
*/
  constructor(public dialogRef: MatDialogRef<FeedbackModalComponent>, @Inject(MAT_DIALOG_DATA) public media: Media) { }

  ngOnInit(): void {
  }

  close() {this.dialogRef.close();}
}
