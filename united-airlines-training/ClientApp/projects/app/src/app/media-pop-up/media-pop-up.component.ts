import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'app-media-pop-up',
  templateUrl: './media-pop-up.component.html',
  styleUrls: ['./media-pop-up.component.css']
})
export class MediaPopUpComponent implements OnInit {

  videoPlayer: HTMLVideoElement;

  //Referenced data is passed in by whatever component opens the dialog
  constructor(public dialogRef: MatDialogRef<MediaPopUpComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
  }

  close() {
    /*
     * Called when the dialog is closed
     */
    //If the modal is displaying a video, pause the video and pass it's current time back to the parent component
    if (this.data.type == 2) {
      this.videoPlayer = document.querySelector("#popVideo");
      this.videoPlayer.pause();
      this.dialogRef.close(this.videoPlayer.currentTime);
      console.log(this.videoPlayer.currentTime);
    }
    //Otherwise just do a normal close
    else {
      this.dialogRef.close();
    }
  }
}
