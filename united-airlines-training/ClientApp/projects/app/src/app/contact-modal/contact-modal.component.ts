/*
  Author: Chris Nosowsky
*/
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-modal',
  templateUrl: './contact-modal.component.html',
  styleUrls: ['./contact-modal.component.css']
})
export class ContactModalComponent implements OnInit {
  contact: boolean = true;
  constructor(public dialogRef: MatDialogRef<ContactModalComponent>) { }

  ngOnInit(): void {
  }

  close() { this.dialogRef.close(); }
}
