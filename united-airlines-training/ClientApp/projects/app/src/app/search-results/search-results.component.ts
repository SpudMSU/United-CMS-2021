import { Component, OnInit } from '@angular/core';
import { Media } from '../models/media';
import { ActivatedRoute } from '@angular/router';
import { MediaService } from '../services/media.service';
import { Channel } from '../models/channel';
import { ChannelService } from '../services/channel.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MediaPopUpComponent } from '../media-pop-up/media-pop-up.component';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit {

  results: Media[];
  channels: Channel[];
  searchTerm = '';
  searchType = 'media';
  SitePath: string = environment.SitePath;

  constructor(private _userService: UserService, private mediaService: MediaService, private route: ActivatedRoute, private _channelservice: ChannelService, private matDialog: MatDialog, private _sanitizationService: DomSanitizer) { }

  ngOnInit(): void {
    //Used to prevent an issue with the site path
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)
    //When the route changes, update the search term and search results
    this.route.params.subscribe(params => { this.searchType = decodeURIComponent(params.searchType); this.searchTerm = decodeURIComponent(params.searchTerm); this.updateSearchResults(); });
  }

  updateSearchResults() {
    //Update the results only if something has been searched
    if (this.searchTerm != '') {
      //Search for media
      if (this.searchType == 'media') {
        this.mediaService.searchForMediaByTitle(this.searchTerm).subscribe(results => {
          this.results = results;
        });
        //Clear the channels from the display if there are any left over
        if (this.channels != null && this.channels.length > 0) {
          this.channels.splice(0, this.channels.length);
        }
      }
      //Search for channels
      else {
        this._channelservice.searchForChannelsByTitle(this.searchTerm).subscribe(data => {
          this.channels = data;
        });
        //Clear the media results from the display if there are any left over
        if (this.results != null && this.results.length > 0) {
          this.results.splice(0, this.results.length);
        }
      }
    }
  }

  openDialog(selectedMedia) {
    /*
     * Used to open modal dialogs in order to display media
     */
    //PDFs must be passed into the PDFjs viewer in order to work
    //let PDFPath = this.SitePath + "/StaticFiles/pdfjs/web/viewer.html?file=" + this.SitePath + selectedMedia.path
    let PDFPath = this.SitePath + "/assets/pdfjs/web/viewer.html?file=" + this.SitePath + selectedMedia.path
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "120vw";
    dialogConfig.height = "95%";
    //Variable for tracking time
    let pageTracker = 0;
    //IF media type is PDF, use the PDF path, otherwise use a regular path
    if (selectedMedia.mediaTypeID == 1) {
      dialogConfig.data = { title: selectedMedia.title, url: PDFPath, type: selectedMedia.mediaTypeID, curDuration: pageTracker };
    } else {
      dialogConfig.data = { title: selectedMedia.title, url: (this.SitePath + selectedMedia.path), type: selectedMedia.mediaTypeID, curDuration: pageTracker };
    }
    const dialogRef = this.matDialog.open(MediaPopUpComponent, dialogConfig);
  }
}
