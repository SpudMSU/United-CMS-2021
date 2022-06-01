import { Component} from '@angular/core';
import { MediaService } from '../services/media.service';
import { ChannelService } from '../services/channel.service';
import { Media } from '../models/media';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { AnalyticService } from '../services/analytic.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MediaPopUpComponent } from '../media-pop-up/media-pop-up.component';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ChannelService]
})
export class HomeComponent {
  
  recommended: Media[]
  hot: Media[]
  latest: Media[]
  trending: Media[]

  user: User = {
    uid: "",
    firstName: "",
    lastName: "",
    email: "",
    employmentStatus: "",
    company: "",
    occupationTitle: '',
    department: '',
    roleCode: 0,
    createdAt: null,
    updatedAt: null,
  };

  bookmarked: Media[]

  selectedMedia: Media;
  SitePath: string = environment.SitePath

  constructor(private _debugService: MediaService, private _analyticService: AnalyticService, private _userService: UserService, private matDialog: MatDialog, private _sanitizationService: DomSanitizer) { }

  ngOnInit(): void {
    //Pull all the media arrays from previous data in the local storage for quicker loading.
    if (localStorage['recommendedMedia'] != null && localStorage['recommendedMedia'] != '') {
      this.recommended = JSON.parse(localStorage['recommendedMedia']);
    }
    if (localStorage['hotMedia'] != null && localStorage['hotMedia'] != '') {
      this.hot = JSON.parse(localStorage['hotMedia']);
    }
    if (localStorage['latestMedia'] != null && localStorage['latestMedia'] != '') {
      this.latest = JSON.parse(localStorage['latestMedia']);
    }
    if (localStorage['trendingMedia'] != null && localStorage['trendingMedia'] != '') {
      this.trending = JSON.parse(localStorage['trendingMedia']);
    }
    //if (localStorage['bookmarkedMedia'] != null && localStorage['bookmarkedMedia'] != '') {
    //  this.trending = JSON.parse(localStorage['bookmarkedMedia']);
    //}

    //Used to prevent URL pathing issues
    if (this.SitePath.slice(-1) == '/') {
      this.SitePath = this.SitePath.slice(0, -1)
    }

    //Fill all the media arrays with the most up to data info
    this._userService.getCurrentUser().subscribe(data => {
      this.user = data
      this._analyticService.getRecommendedMedia(this.user["uid"]).subscribe(recommendedData => {
        this.recommended = recommendedData;
        //Store the array in local storage for quicker loading later
        localStorage['recommendedMedia'] = JSON.stringify(recommendedData);
      })

      this._analyticService.getHotMedia().subscribe(hotData => {
        console.log(hotData);
        this._analyticService.getOpenedOrPlayedMedia(this.user["uid"]).subscribe(analyticsData => {
          var filtered = [];
          for (let hot of hotData) {
            var ind = analyticsData.findIndex(ele => ele.mediaID == hot.mediaID);
            //var found = analyticsData.includes(hot);
            if (ind == -1) {
              filtered.push(hot);
            }
          }

          this.hot = filtered
          //Store the array in local storage for quicker loading later
          localStorage['hotMedia'] = JSON.stringify(filtered);
        }
        )
      }
      )
    })


    this._analyticService.getLatestMedia().subscribe(latestData => {
      this.latest = latestData;
      //Store the array in local storage for quicker loading later
      localStorage['latestMedia'] = JSON.stringify(latestData);
    }, error => {
      console.log(error)
    })

    this._analyticService.getTrendingMedia().subscribe(trendingData => {
      this.trending = trendingData;
      //Store the array in local storage for quicker loading later
      localStorage['trendingMedia'] = JSON.stringify(trendingData);
    })

}


  openDialog() {
    /*
     * This function is used to open modal pop up dialogs of media items
     */
    //let PDFPath = this.SitePath + "/StaticFiles/pdfjs/web/viewer.html?file=" + this.SitePath + this.selectedMedia.path
    let PDFPath = this.SitePath + "/assets/pdfjs/web/viewer.html?file=" + this.SitePath + this.selectedMedia.path
    //Configure the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "120vw";
    dialogConfig.height = "95%";
    //Variable for tracking time
    let pageTracker = 0;
    if (this.selectedMedia.mediaTypeID == 1) {
      dialogConfig.data = { title: this.selectedMedia.title, url: PDFPath, type: this.selectedMedia.mediaTypeID, curDuration: pageTracker };
    } else {
      dialogConfig.data = { title: this.selectedMedia.title, url: (this.SitePath + this.selectedMedia.path), type: this.selectedMedia.mediaTypeID, curDuration: pageTracker };
    }
    //Tell the dialog to open
    const dialogRef = this.matDialog.open(MediaPopUpComponent, dialogConfig);
  }
}
