/*
  Author: Madelaine Brownley
 */
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';
import { MediaPopUpComponent } from '../media-pop-up/media-pop-up.component';
import { Comment } from '../models/comment';
import { Media } from '../models/media';
import { MediaType } from '../models/media-type';
import { Rating } from '../models/rating';
import { User } from '../models/user';
import { UserHistory } from '../models/user-history';
import { AnalyticService } from '../services/analytic.service';
import { CommentService } from '../services/comment.service';
import { MediaTypeService } from '../services/media-type.service';
import { MediaService } from '../services/media.service';
import { RatingService } from '../services/rating.service';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  SitePath: string = environment.SitePath;

  // current user
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
    costcenter: "",
    createdAt: null,
    updatedAt: null,
  };



  ldRatio: number = 0
  // number of likes media item has
  likes: number = 0
  // number of dislikes media item has
  dislikes: number = 0
  // number of comments user has made
  commentCount: number = 0
  // number of ratings user has made
  ratingCount: number = 0

  // all returned comments
  returnedComments: Comment[] = [];
  // Whether or not the user clicked the search button
  searched: boolean = false;

  mediaOptions = [];
  selectedMedia: Media;


  // User analytics lists
  recommended: Media[] = [];
  recommendedTypes: MediaType[] = [];

  mediaHistory: UserHistory[] = []
  mediaUsers: User[] = []

  userRatings: string[] = [];
  media: Media = {
    thumbnailPath: "",
  };

  // Comments displayed in manage comments section
  commentList: Comment[] = [];

  // Ratings displayed in manage likes section
  ratingsList: Rating[] = [];
  mediaList: Media[] = [];

  bookmarked: Media[] = [];

  constructor(private _userService: UserService,
    private _ratingService: RatingService,
    private _commentService: CommentService,
    private _mediaService: MediaService,
    private _analyticService: AnalyticService,
    private _mediaTypeService: MediaTypeService,
    private matDialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)
    this.getUser()

    this._mediaService.getAllItems().subscribe(res => {
      this.addMediaTitles(res);
    })

    if (localStorage['recommendedMedia'] != null && localStorage['recommendedMedia'] != '') {
      this.recommended = JSON.parse(localStorage['recommendedMedia']);
    }

    //Fill all the media arrays with the most up to data info
    this._userService.getCurrentUser().subscribe(data => {
      this.user = data
      this._analyticService.getRecommendedMedia(this.user["uid"]).subscribe(recommendedData => {
        this.recommended = recommendedData;
        //Store the array in local storage for quicker loading later
        localStorage['recommendedMedia'] = JSON.stringify(recommendedData);
      })
    })

  }

 /**
 * Get's all media titles to display in the bookmarked media (for Alpha)
 */
  addMediaTitles(res: Media[]) {
    for (let media of res) {
      if (media.mediaStatus == 'A')
        this.mediaOptions.push({ id: media.mediaID, title: media.title })
    }
    this.mediaOptions = this.mediaOptions.sort((a, b) => {
      if (a.title > b.title)
        return 1
      if (a.title < b.title)
        return -1
      return 0
    })
    this.mediaOptions.unshift({ id: 0, title: "All" })
  }

/**
* Get current user information
*/
  getUser() {
    this._userService.getCurrentUser().subscribe(res => {
      if (res != null) {
        this.user = res
        this.gatherUserAnalytics()
      }
    })
    console.log(this.user.costcenter);
    console.log(this.user.firstName);
  }

  /**
   * Get user recommended media, current user's comments, and current user's likes
   */
  async gatherUserAnalytics() {
    await new Promise((resolve, reject) => {
      this._analyticService.getRecommendedMedia(this.user["uid"]).subscribe(data => {
        var recommended2 = data
        this.recommended = recommended2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        const obs = this.recommended.map(t => this._mediaTypeService.getMediaType(t.mediaTypeID))
        forkJoin(obs).subscribe(data => {
          this.recommendedTypes = data
        })
      })

      this._commentService.getAllUserComments(this.user["uid"]).subscribe(data => {
        this.commentCount = data.length
      })

      this._commentService.getAllUserComments(this.user["uid"]).subscribe(data => {
        this.commentList = data
      })

      this._ratingService.getAllUserRatings(this.user["uid"]).subscribe(data => {
        this.ratingCount = data.length
      })
      
      this._ratingService.getAllUserRatings(this.user["uid"]).subscribe(data => {
        this.ratingsList = data
        console.log(this.ratingsList);
        for (let d of data) {
          this._mediaService.getMedia(d.mediaID).subscribe(res => {
            if (res != null) {
              this.mediaList.push(res)
            }
          })
        }
        console.log(this.mediaList);
      })
    });
  }


  /**
  * Get media page analytics. FOR THE MEDIA REPORT SIDE!!
  */
  async gatherMediaPageUserAnalytics() {
    await new Promise((resolve, reject) => {
      this._userService.getMediaHistory(this.media.mediaID).subscribe(data => {
        var mediaHistory2 = data
        this.mediaHistory = mediaHistory2.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        resolve();
      })
    });

    const obs = this.mediaHistory.map(t => this._userService.getUser(t["uid"]))
    // rxjs function to subscribe to a list of obserables to avoid any asynchronous issues
    forkJoin(obs).subscribe(data => {
      this.mediaUsers = data
    })

    const obs2 = this.mediaHistory.map(t => this._ratingService.getUserMediaRating(this.media.mediaID, t["uid"]))
    // rxjs function to subscribe to a list of obserables to avoid any asynchronous issues
    forkJoin(obs2).subscribe(data => {
      for (let d of data) {
        if (d == null)
          this.userRatings.push("N/A")
        else if (d.like)
          this.userRatings.push("liked")
        else
          this.userRatings.push("disliked")
      }
    })
    

    this._ratingService.getMediaRatingLikesAndDislikes(this.media.mediaID).subscribe(data => {
      if (data.likes == 0 && data.dislikes == 0)
        this.ldRatio = 0
      else
        this.ldRatio = data.likes / (data.likes + data.dislikes)
      this.likes = data.likes
      this.dislikes = data.dislikes
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
