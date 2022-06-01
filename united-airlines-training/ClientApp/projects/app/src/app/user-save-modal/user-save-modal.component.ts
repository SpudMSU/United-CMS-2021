/*
  Author: Chris Nosowsky
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-user-save-modal',
  templateUrl: './user-save-modal.component.html',
  styleUrls: ['./user-save-modal.component.css']
})
export class UserSaveModalComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UserSaveModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

/**
* Component initialize function
*/
  ngOnInit(): void {
  }

/**
* Closes the modal when yes or no is clicked
*/
  close(res: boolean) {
    this.dialogRef.close(res);
  }

}
