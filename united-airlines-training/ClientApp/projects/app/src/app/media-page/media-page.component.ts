import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MediaPopUpComponent } from '../media-pop-up/media-pop-up.component';
import { Media } from '../models/media';
import { Rating } from '../models/rating';
import { Comment } from '../models/comment';
import { User } from '../models/user';
import { DomSanitizer } from '@angular/platform-browser';
import { AnalyticService } from '../services/analytic.service';
import { RatingService } from '../services/rating.service';
import { UserService } from '../services/user.service';
import { CommentService } from '../services/comment.service';
import * as moment from 'moment';
import { UserHistory } from '../models/user-history';
import { MediaService } from '../services/media.service';
import { DistanceLearningSession } from '../models/distance-learning-session';
import { FeedbackModalComponent } from '../feedback-modal/feedback-modal.component';
import { environment } from '../../environments/environment';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AppSettingsService } from '../services/appsettings.service';
import { browserRefresh } from '../app.component';
import { UserSaveModalComponent } from '../user-save-modal/user-save-modal.component';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { ChangedMediaService } from '../services/changed-media.service';
import { ChangedMedia } from '../models/changed-media';
import { isNull } from 'util';
import { CommentsViewComponent } from './comments-view/comments-view.component';

@Component({
  selector: 'app-media-page',
  templateUrl: './media-page.component.html',
  styleUrls: ['./media-page.component.css']
})
export class MediaPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('videoPlayerElement') videoPlayer: ElementRef;
  @ViewChild("commentsView") commentsView: CommentsViewComponent;

  SitePath: string = environment.SitePath
  //Initialize these variables to have some default value. These values get overwritten once the page starts up
  curURL = "/StaticFiles/24_737NG_IDG_Oil_Level_Check.mp4";
  curFileType = "Video";
  curTitle = "Aircraft Parking Procedures";
  curViewCount = 53001;
  curUploader = "Ted";
  curLikes = 1744;
  curDislikes = 92;
  curLiked = false;
  curDisliked = false;
  curDescription = "These instructions will show you the essential procedures required to safely park an aircraft.";
  roleCodeLevel = 0;
  //Initial number of related media to show
  relatedCap = 15;

/*State Trackers*/
  //Whether or not you are editing the title
  editTitle = false;
  //Whether or not you are editing the description
  editDesc = false;
  //Whether or not videos should play automatically
  autoplayVideos = false;

  //Used for file path on PDF file types
  PDFpath: string = "";
  //These are used to store the edits you are making to the video information
  tmpTitle: string = "";
  tmpDesc: string = "";

  //Used for timezone conversion from the database
  curTimezoneOffset: string = "";

  //This is the array that holds media content related to the one currently being viewed
  related: Media[] = [];
  //This is the array that holds only the subset of related media we want to display
  //We do this because returning a potentially infinite number of media is not a good idea
  displayRelated: Media[] = [];

  // This will hold the current user UID
  uid: string = "";
  //Initialize a default user which will have its values overwritten
  currentUser: User = {
    uid: '123123',
    roleCode: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Boolean to check if the user has rated a particular media item
  userRatingExists: boolean = false;
  // Stored if user rating does exist on media item
  userRatingContent: Rating;

  rating: Rating;
  talkLinks: DistanceLearningSession[] = [];

  initialFunctionCall: boolean = true;

  // Hacky, waits to load the comment-view component until this bool is set true (after current user and media item have been retreived from the server)
  commentsSectionLoaded: boolean = false;
  commentingEnabled: boolean;
  commentingDisabledBannerVisible: boolean;
  commentingDisabledBanner: boolean;
  commentingAutoApprove: boolean;

  mediaLoaded: boolean = false;

  constructor(private matDialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private _analyticService: AnalyticService,
    private _ratingService: RatingService,
    private _userService: UserService,
    private _commentService: CommentService,
    private _sanitizationService: DomSanitizer,
    private _adminAuditService: AdminAuditLogService,
    private _changedMediaService: ChangedMediaService,
    private _mediaService: MediaService,
    private _appSettingService: AppSettingsService,
    private route: ActivatedRoute,
    private router: Router) { }

  //This is the currently selected piece of media
  selectedMedia: Media = {
    mediaID: 0,
    title: "",
    description: "",
    createdAt: new Date(),
    mediaTypeID: 0
  };

  MediaBeforeEdit: Media;
  //This is the video player on the media page
  //videoPlayer: HTMLVideoElement;

  public browserRefresh: boolean;

  videoClicked: boolean = false

  // Current time
  currentTime = moment(new Date())

  // A list of all the user comment dates
  commentDates = []

  // A list of all the users who commented
  usersWhoPosted = []

  refreshedAndHistoryAlreadyUpdated: boolean = false

  ngOnInit(): void {
    //Get the current user
    this._userService.getCurrentUser().subscribe(user => {
      this.uid = user["uid"]
      this.currentUser = user
      console.log(this.currentUser)
    })

    this._appSettingService.getCommentAutoApprove().subscribe(response => {
      this.commentingAutoApprove = response['autoApprove'];
    })

    this._appSettingService.getMediaCommentingSettings().subscribe(response => {
      this.commentingEnabled = response['commentingEnabled'];
      this.commentingDisabledBannerVisible = response['commentingDisabledBannerVisible']
      this.commentingDisabledBanner = response['commentingDisabledBanner']
    })

    //Prevent a site pathing issue
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    //Get whether or not videos should autoplay from appsettings.json
    this._appSettingService.getVideoAutoPlay().subscribe(res => {
      this.autoplayVideos = res["autoplay"]
      //console.log("AUTO PLAY: " + this.autoplayVideos)
    })

    this.browserRefresh = browserRefresh;

    //console.log('refreshed?:', browserRefresh);

    //Check the URL route and get the media associated with it
    this.route.params.subscribe(params => {
      this._mediaService.getMedia(params.mediaID).subscribe(media => {
        if (!this.initialFunctionCall) {
          this.updateRatingAndHistory()
        } else {
          this.initialFunctionCall = false;
        }
        this.selectedMedia = media;
        if (this.commentingEnabled) {
          this.commentingEnabled = media.commentingEnabled == null || media.commentingEnabled ? true : false;
        }

        // Initialize the comments section
        this.commentsSectionLoaded = true;
        this.MediaBeforeEdit = Object.assign({}, media);
        console.log(this.MediaBeforeEdit)
        console.log("construct^^")
        if (this.browserRefresh) {
          this.createOrUpdateUserHistory()
          this.browserRefresh = false
          this.refreshedAndHistoryAlreadyUpdated = true
        }
        //PDF File types need to be passed to the viewer from PDFjs
        //this.PDFpath = this.SitePath + "/StaticFiles/pdfjs/web/viewer.html?file=" + this.SitePath + this.selectedMedia.path
        this.PDFpath = this.SitePath + "/assets/pdfjs/web/viewer.html?file=" + this.SitePath + this.selectedMedia.path  // UNCOMMENT ON BUILD!
        this.updateSelected(this.selectedMedia);
        this.mediaLoaded = true;

      })
    })
  }

  ngOnDestroy() { // If user closes browser or goes to another link/page, this will call the update user rating function
    if (!this.browserRefresh && !this.refreshedAndHistoryAlreadyUpdated) {
      this.updateOrCreateUserRating()
      this.createOrUpdateUserHistory()
    }
    this.refreshedAndHistoryAlreadyUpdated = false;
  }

  ngAfterViewChecked() {
    //Used to prevent an error with the videoplay viewchild being changed after being checked
    if (this.selectedMedia.mediaTypeID == 2) {
      this.cdRef.detectChanges();
    }
  }

  @HostListener("window:beforeunload") callRating() { // Listens for page refresh before calling update user rating function or user history function
    this.updateOrCreateUserRating()
  }

  /*
   * Functions used to convert date formats from database
   */
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate;
  }

  convertUploadDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    var newString = moment(newDate).format("MMM Do, YYYY")
    return newString
  }

  convertTalkDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    var newString = moment(newDate).format("MMM Do, YYYY LT");
    return newString;
  }

  async callServiceFunctions() {
    //// Comment ////
    //this.getMediaComments()

    //// Rating ////
    // Gets all the likes and dislikes for a media
    this._ratingService.getMediaRatingLikesAndDislikes(this.selectedMedia.mediaID).subscribe(res => {
      this.curLikes = res["likes"]
      this.curDislikes = res["dislikes"]
    })

    //// User History ////
    // Gets the total view count for a media
    this._userService.getMediaViews(this.selectedMedia.mediaID).subscribe(views => {
      this.curViewCount = views['totalViews']
    })

    //// User ////
    // Gets the current user looking at the media page
    await new Promise((resolve, reject) => {
      this._userService.getCurrentUser().subscribe(user => {
        this.uid = user["uid"]
        this.currentUser = user
        this.roleCodeLevel = user.roleCode;
        //if (this.roleCodeLevel >= 2) {
        //  this._commentService.getQueuedMediaComments(this.selectedMedia.mediaID).subscribe(queued => {
        //    this.queuedComments = queued
        //    this.loadQueuedComments()
        //  })
        //}
        // Get the user media rating if it exists (not null)
        this._ratingService.getUserMediaRating(this.selectedMedia.mediaID, this.uid).subscribe(res => {
          if (res != null) {  // If not null, then the user has liked or disliked this media.
            this.userRatingExists = true;
            this.userRatingContent = res
            if (res.like == true) {
              this.curLiked = true
            }
            else if (res.like == false) {
              this.curDisliked = true
            }
          }
        })
        resolve();
      })
    });
  }


  //getMediaComments() {
  //  this._commentService.getMediaComments(this.selectedMedia.mediaID).subscribe(comments => {
  //    this.mediaComments = comments
  //    this.loadMediaComments()
  //  })
  //}



  logChanges(title: string, change: string, mediaID: number, media: Media, cata = "Media") {
    console.log(mediaID)
    console.log([title, change, mediaID]);
    this._userService.getCurrentUser().subscribe(user => {
      let userName = user.firstName.concat(" ").concat(user.lastName)
      let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
      let role = roles[user.roleCode - 1];
      let currentdate = new Date()
      const entry: AdminAuditLog =
      {
        id: 0,
        category: cata,
        item: title,
        change: change,
        username: userName,
        userRole: role,
        changeDate: currentdate,
        mediaID: mediaID,
        reverted: false
      }
      console.log(entry)
      this._adminAuditService.createEntry(entry).subscribe(x => {

        if (cata == "Media" && !isNull(media)) {
          const changedMedia: ChangedMedia =
          {
            changeID: x.id,
            mediaID: media.mediaID,
            mediaStatus: media.mediaStatus,
            title: media.title,
            description: media.description,
            thumbnailPath: media.thumbnailPath,
            mediaTypeID: media.mediaTypeID,
            path: media.path,
            flaggedAllUsers: media.flaggedAllUsers,
            flaggedLocations: media.flaggedLocations,
            flaggedJobCodes: media.flaggedJobCodes,
            flaggedCostCenters: media.flaggedCostCenters,
            createdAt: media.createdAt
          }
          console.log(changedMedia)
          this._changedMediaService.postChangedMedia(changedMedia).subscribe(x => {
            this.MediaBeforeEdit = Object.assign({}, this.selectedMedia);
          });

        }
      })
    })
  }



  // Function checks if user has liked or disliked media. If they have, check if they already have an existant record
  // in the table. If not, create the user rating. If they do, update it.
  // Lastly, check if user rating exists and they didn't like or dislike the media. If the user rating exists, delete it.
  updateOrCreateUserRating() {
    if (this.curLiked) {  // IF LIKE IS SET.
      //console.log("Like set")
      this.rating = { uId: this.uid, mediaID: this.selectedMedia.mediaID, like: true, createdAt: new Date() }
    } else if (this.curDisliked) {  // IF DISLIKE IS SET
      //console.log("Dislike set")
      this.rating = { uId: this.uid, mediaID: this.selectedMedia.mediaID, like: false, createdAt: new Date() }
    } else {  // IF NEITHER LIKE OR DISLIKE SET. DELETE IT.
      if (this.userRatingExists) {
        //console.log("Delete it!")
        this._ratingService.deleteRating(this.uid, this.selectedMedia.mediaID).subscribe(res => console.log('Rating deleted.'))
      }
      return
    }

    if (this.userRatingExists) {
      if (this.rating.like != this.userRatingContent.like) {
        //console.log("user rating already exists. Update it.")
        this._ratingService.updateRating(this.uid, this.selectedMedia.mediaID, this.rating).subscribe(res => console.log("Rating updated."))
      }
    } else {
      //console.log("user rating doesn't exist. Create it.")
      this._ratingService.createRating(this.rating).subscribe(res => console.log('Rating created.'))
      this.userRatingExists = true
    }
  }

  clickLike() {
    if (this.curLiked) {
      this.curLiked = false;
      this.curLikes -= 1;
    }
    else {
      this.curLiked = true;
      this.curLikes += 1;
      if (this.curDisliked) {
        this.curDisliked = false;
        this.curDislikes -= 1;
      }
    }
  }

  clickDislike() {
    if (this.curDisliked) {
      this.curDisliked = false;
      this.curDislikes -= 1;
    }
    else {
      this.curDisliked = true;
      this.curDislikes += 1;
      if (this.curLiked) {
        this.curLiked = false;
        this.curLikes -= 1;
      }
    }
  }

  //Displays the media feedback modal
  openFeedbackDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = this.selectedMedia
    const dialogRef = this.matDialog.open(FeedbackModalComponent, dialogConfig);
  }

  //Displays the media pop out component
  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "120vw";
    dialogConfig.height = "95%";
    //Variable for tracking time
    let pageTracker = 0;
    //Actions specific to the video file type
    if (this.selectedMedia.mediaTypeID == 2) {
      //Pause video on base page when modal pop up comes up
      this.videoPlayer.nativeElement.pause();
      //Pass important data to the modal, such as what time to start the video at
      dialogConfig.data = {
        title: this.selectedMedia.title,
        url: (this.SitePath + this.selectedMedia.path),
        type: this.selectedMedia.mediaTypeID, curDuration: this.videoPlayer.nativeElement.currentTime
      };
    }
    //Actions specific to the PDF file type
    else if (this.selectedMedia.mediaTypeID == 1) {
      dialogConfig.data = { title: this.selectedMedia.title, url: this.PDFpath, type: this.selectedMedia.mediaTypeID, curDuration: pageTracker };
    }
    //Actions for all other file types
    else {
      dialogConfig.data = { title: this.selectedMedia.title, url: (this.SitePath + this.selectedMedia.path), type: this.selectedMedia.mediaTypeID, curDuration: pageTracker };
    }
    const dialogRef = this.matDialog.open(MediaPopUpComponent, dialogConfig);

    //When you close the modal and if it was a video file type
    if (this.videoPlayer != null && this.selectedMedia.mediaTypeID == 2) {
      dialogRef.afterClosed().subscribe(closeData => {
        //console.log("CLOSE DATA: ", closeData);
        //Set the video time on the base page to the time on the modal when it was closed
        this.videoPlayer.nativeElement.currentTime = closeData;
      });
    }
  }


  updateRatingAndHistory() {
    // This functions gets called on a click to another related media so it can determine whether
    // or not it needs to update or create a user rating.
    if (!this.browserRefresh && !this.refreshedAndHistoryAlreadyUpdated) {
      this.updateOrCreateUserRating()
      this.createOrUpdateUserHistory()
    }
    this.refreshedAndHistoryAlreadyUpdated = false;
  }

  updateSelected(newMedia) {
    /*
     * Updates the selected media item on the page
     */
    // On each media change, this will reset the below 3 variables so they can don't overlap logic
    this.curLiked = false
    this.curDisliked = false
    this.userRatingExists = false
    this.videoClicked = false

    this.commentDates = []
    this.usersWhoPosted = []

    this.talkLinks.splice(0, this.talkLinks.length)

    if (this.selectedMedia.mediaTypeID == 2) {
      //Reset the video player so that the new video can play without issue
      if (this.videoPlayer != null) {
        this.videoPlayer.nativeElement.pause();
        this.videoPlayer.nativeElement.currentTime = 0;
        this.videoPlayer.nativeElement.load();
      }
    }

    this.callServiceFunctions()
    this._analyticService.getRelatedMedia(this.selectedMedia.mediaID).subscribe(latestData => {
      this.related = latestData;
      //Display only the number of related media specified
      this.displayRelated = this.related.splice(0, this.relatedCap);
    }, error => {
      console.log(error)
    })

    //localStorage['curMedia'] = JSON.stringify(newMedia);
  }

  openTabLink() {
    /*
     * This function is used to open the media in a new tab
     */
    if (this.selectedMedia.mediaTypeID == 2) {
      this.videoClicked = true
      //Reset the video player so that the new video can play without issue
      this.videoPlayer.nativeElement.pause();
    }
    window.open(this.SitePath + this.selectedMedia.path, "_blank");

  }

  updateTitle() {
    /*
     * Function to save edits to the media title
     */

    let change = "Updated Title"
    let mediaID = this.selectedMedia.mediaID
    this.editTitle = false;
    this.selectedMedia.title = this.tmpTitle;
    let title = this.selectedMedia.title
    this.logChanges(title, change, mediaID, this.MediaBeforeEdit)
    this._mediaService.updateMedia(this.selectedMedia.mediaID, this.selectedMedia).subscribe();
    //localStorage['curMedia'] = JSON.stringify(this.selectedMedia);
  }

  updateDesc() {
    /*
     * Function to save edits to the description of the media item
     */
    let change = "Updated Description"
    let mediaID = this.selectedMedia.mediaID
    this.editDesc = false;
    this.selectedMedia.description = this.tmpDesc;
    let title = this.selectedMedia.title
    this.logChanges(title, change, mediaID, this.MediaBeforeEdit)
    this._mediaService.updateMedia(this.selectedMedia.mediaID, this.selectedMedia).subscribe();
    //localStorage['curMedia'] = JSON.stringify(this.selectedMedia);
  }

  async createOrUpdateUserHistory() {
    // Consideration: What if user watches entire video and accidentally clicks back to start? (may need to use played attribute on videoplayer for object timeranges)
    // Note: doesn't count user history on refresh of page??
    let newWatchLength = 0
    //console.log(this.selectedMedia.mediaID)
    let history: UserHistory = { uId: this.uid, mediaId: this.selectedMedia.mediaID, watchLength: 0.5, clickedAmount: 1, createdAt: new Date(), completeView: false, updatedAt: new Date() }
    if (this.selectedMedia.mediaTypeID == 2) {
      if (this.videoPlayer != null) {
        if (this.videoPlayer.nativeElement.currentTime == 0) {
          //console.log("DID NOT CLICK ON VIDEO. DO NOT UPDATE OR CREATE HISTORY.")
          return
        }
        newWatchLength = this.videoPlayer.nativeElement.currentTime / this.videoPlayer.nativeElement.duration
      }
      if (this.videoPlayer != null && this.videoPlayer.nativeElement.currentTime > (this.videoPlayer.nativeElement.duration - 5)) { // RANGE IS 5 SECONDS. COUNT AS WATCHED FULLY IF THEY DON'T WATCH LAST 5 SECONDS.
        //console.log('count as full watch')
        newWatchLength = 1
      }
      history.watchLength = newWatchLength
      if (newWatchLength == 1)
        history.completeView = true
    }
    await new Promise((resolve, reject) => {
      this._userService.getUserHistory(this.uid, this.selectedMedia.mediaID).subscribe(res => {

        if (res == null) {
          this._userService.createUserHistory(history).subscribe(res => console.log('history created'))
        } else {
          res.clickedAmount += 1
          res.updatedAt = new Date()
          if (this.selectedMedia.mediaTypeID == 2) {
            if (newWatchLength > res.watchLength) {
              //console.log("Update watch length for user. Current watch length is greater then previous longest watch length.")
              res.watchLength = newWatchLength
              if (res.watchLength == 1)
                res.completeView = true
            }
          }
          this._userService.updateUserHistory(res).subscribe(res => console.log('history updated'))
        }
        resolve();
      })
    });
    return
  }

  encodeVal(val: string): string {
    /*
     * Used to sanitize URLs of media so that they can be dynamically displayed
     * by Angular
     */
    return encodeURI(val)
  }

}
