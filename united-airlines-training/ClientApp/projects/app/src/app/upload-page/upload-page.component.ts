import { Component, OnInit, NgModule, ViewChild } from '@angular/core';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { DistanceLearningSession } from '../models/distance-learning-session';
import { MediaService } from '../services/media.service';
import { Media } from '../models/media';
import { Keyword } from '../models/keyword';
import { KeywordService } from '../services/keyword.service';
import { environment } from '../../environments/environment';
import { NestedChannel } from '../models/nested-channel';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { User } from '../models/user';
import { ChangedMedia } from '../models/changed-media';
import { ChangedMediaService } from '../services/changed-media.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettingsService } from '../services/appsettings.service';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserSaveModalComponent } from '../user-save-modal/user-save-modal.component';
import * as moment from 'moment';
import { DistanceLearningMedia } from '../models/distance-learning-media';
import { DistanceLearningAttendanceRequirement } from '../models/DistanceLearningAttendanceRequirement';


@Component({
  selector: 'app-upload-page',
  templateUrl: './upload-page.component.html',
  styleUrls: ['./upload-page.component.css']
})

export class UploadPageComponent implements OnInit {
  @ViewChild("keywordAutocomplete") keywordAutocomplete;
  @ViewChild("locationAutocomplete") locationAutocomplete;
  @ViewChild("jobCodesAutocomplete") jobCodesAutocomplete;
  @ViewChild("jobGroupsAutocomplete") jobGroupsAutocomplete;
  @ViewChild("departmentsAutocomplete") departmentsAutocomplete;
  @ViewChild("costCentersAutocomplete") costCentersAutocomplete;

  // Editing stuff
  editing: boolean = false;
  editingMediaID: number;
  editingMediaItem: Media;
  isEditingMediaRetired: boolean;
  addedChannels: Channel[] = [];
  removedChannel: Channel[] = [];
  addedKeywords: string[] = [];
  removedKeywords: string[] = [];

  //Used for the media type selection dropdown. Set to PDF by default
  selectedMediaType: number = 1;
  mediaTypeSelect: HTMLSelectElement;
  //Channels the user can select
  selectableChannels: Channel[] = [];
  ///Channels the user has selected
  uploadChannels: Channel[] = [];
  uploadChannelText: object[] = [];
  allChannels: Channel[] = [];
  channelRelationships: NestedChannel[] = [];
  //Array to hold error texts (Ex: "No title!")
  errorTexts: String[] = [];
  //Array to hold tech talk links the user has added
  talks: DistanceLearningSession[] = [];

  origin: string = environment.origin;
  sitePath: string = environment.SitePath;
  defaultThumbnail: string
  defaultThumbnailExists: boolean;
  thumbnailSource: string = "";
  thumbNailErrorVisible: boolean = false;
  thumbNailErrorText: string = "";
  thumbNailPathError: boolean = false;

  curTitle: string = "";
  curDescription: string = "";
  filePath: string = "";
  urlPath: string = "";
  //Thumbnail path
  thumbPath: string;
  thumbNailActive: boolean = false;
  //Array to hold the keywords the user has added to the media
  keywordStrings: string[] = [];
  submissionMsg: string = "";
  editSuccessMessage: string = "Media Successfully Updated!";
  uploadSuccessMessage: string = "Media Successfully Uploaded!";
  mediaBeforeEdit: Media
  allKeywords: string[] = [];

  // flags 
  mediaIsFlaggedForAll = false;
  locationFlags: string[] = [];
  jobCodeFlags: string[] = [];
  jobGroupFlags: string[] = [];
  departmentFlags: string[] = [];
  costCenterFlags: string[] = [];

  distinctLocations = []
  distinctJobCodes = []
  distinctJobGroups = []
  distinctDepartments = []
  distinctCostCenters = []

  commentingEnabled: boolean;

  distanceLearningPasscodeFormActive: boolean = false;

  // Distance learning stuff
  attendanceRequirements: DistanceLearningAttendanceRequirement[] = [];
  currentUser: User;

  submissionSubject = new Subject<boolean>();
  selectedChannelsSubject = new Subject<Channel[]>();

  constructor(private _channelservice: ChannelService,
    private _mediaService: MediaService,
    private _keywordService: KeywordService,
    private _http: HttpClient,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedMediaService: ChangedMediaService,
    private _router: Router,
    private route: ActivatedRoute,
    private _appSettingsService: AppSettingsService,
    private _changedChannelService: ChangedChannelService,
    private _matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log(new Date().toISOString());
    //Prevent a site pathing issue
    if (this.sitePath.slice(-1) == '/') {
      this.sitePath = this.sitePath.slice(0, -1)
    }

    this._appSettingsService.getDefaultThumbnailImage().subscribe(img => {
      this.defaultThumbnail = img['defaultImage'];
      this.fileExists(this.sitePath + this.defaultThumbnail).subscribe(exists => {
        this.defaultThumbnailExists = exists;
        if (exists) {
          this.thumbPath = this.defaultThumbnail;
          this.thumbnailSource = this.sitePath + this.defaultThumbnail;
          this.thumbNailActive = true;
        } else {
          this.thumbPath = this.defaultThumbnail;
          this.throwThumbnailError("Default thumbnail '" + this.defaultThumbnail + "' not found.  Please enter a valid thumbnail image path", true);
        }
      })
    })

    this.mediaTypeSelect = document.querySelector("#mediaTypeDropdown");
    this.mediaTypeSelect.selectedIndex = this.selectedMediaType - 1;

    //Fill the array of selectable channels
    let rootChannels: Channel[] = [];
    let channelRelationships: NestedChannel[] = [];

    this._keywordService.getAllKeywords().subscribe(data => {
      for (let keyword of data) {
        this.allKeywords.push(keyword.word);
      }
    })

    this._userService.getAllFlags().subscribe(data => {
      this.distinctLocations = data['distinctLocations'];
      this.distinctJobCodes = data['distinctJobCodes'];
      this.distinctJobGroups = data['distinctJobGroups'];
      this.distinctDepartments = data['distinctDepartments'];
      this.distinctCostCenters = data['distinctCostCenters'];
    })

    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Big and ugly way to get the full list of channel associations

    // First get the root channels (channels with no parents)
    this._channelservice.getRootChannels().subscribe(data => {
      rootChannels = data;

      // Then get ALL the channels
      this._channelservice.getAllChannels().subscribe(data => {
        this.allChannels = data;

        // Then get all the child-parent relationships
        this._channelservice.getChannelRelationships().subscribe(data => {
          this.channelRelationships = data;

          // then create the child-parent associations in allChannels
          for (let channel of this.allChannels) {
            let rels = this.channelRelationships.filter(ele => ele.parentId == channel.channelID);
            for (let childRel of rels) {
              let child = this.allChannels.find(ele => ele.channelID == childRel.childId);
              child.parentId = channel.channelID;
              if (!channel.child) {
                channel.child = []
              }
              channel.child.push(child);
            }
          }

          // Then fill the place of all the channels in rootChannels with it's fully-associated version
          let i = 0;
          while (i < rootChannels.length) {
            let fullChannel = this.allChannels.find(ele => ele.channelID == rootChannels[i].channelID);
            rootChannels[i] = fullChannel;
            i += 1;
          }
          this.selectableChannels = rootChannels;

          // Check whether or not we're editing a media item
          this.route.params.subscribe(params => {
            let mediaId = Number(params.mediaID);
            this.editing = !isNaN(mediaId);
            if (this.editing) {
              this.initializeEditingMedia(mediaId);
            }
          })
        })
      })

    })
  }

  throwThumbnailError(message: string, persist: boolean = false) {
    this.thumbNailPathError = true;
    this.thumbNailErrorText = message;
    this.thumbNailErrorVisible = true;
    if (!persist) {
      setTimeout(() => this.thumbNailErrorVisible = false, 10000);
    }
  }

  /**
   * Initialize the page elements to be filled with the content from a given media item
   * 
   * @param mediaId the ID of the media item to fill the page using
   */
  initializeEditingMedia(mediaId) {
    this.editingMediaID = mediaId;
    this._mediaService.getMedia(mediaId).subscribe(data => {
      this.editingMediaItem = data;
      this.mediaBeforeEdit = Object.assign({}, data);
      this.commentingEnabled = data.commentingEnabled == null || data.commentingEnabled ? true : false;
      this.isEditingMediaRetired = data.mediaStatus == "R";

      // populate fields with media information
      this.curTitle = data.title;
      this.curDescription = data.description;

      if (data.flaggedAllUsers != null) {
        this.mediaIsFlaggedForAll = data.flaggedAllUsers;
      } else {
        this.mediaIsFlaggedForAll = false;
      }

      this.selectedMediaType = data.mediaTypeID;
      this.mediaTypeSelect.selectedIndex = this.selectedMediaType - 1;
      this.thumbPath = data.thumbnailPath;
      this.fileExists(this.sitePath + data.thumbnailPath).subscribe(exists => {
        if (exists) {
          this.thumbNailErrorVisible = false;
          this.thumbnailSource = this.sitePath + data.thumbnailPath;
          this.thumbNailActive = true;
          this.thumbNailPathError = false;
        } else {
          if (this.defaultThumbnailExists) {
            this.throwThumbnailError("image: '" + data.thumbnailPath + "' not found, thumbnail replaced with default");
            this.thumbPath = this.defaultThumbnail;
            this.thumbnailSource = this.sitePath + this.defaultThumbnail;
          } else {
            this.throwThumbnailError("image: '" + data.thumbnailPath + "' not found, please enter a valid thumbnail image path", true);
          }
          this.thumbNailActive = this.defaultThumbnailExists;
        }
      })
      //this.thumbnailImg.src = this.thumbPath;

      if (this.selectedMediaType == 6) {
        this.urlPath = data.path;
      }

      // Distance learning stuff
      else if (this.selectedMediaType == 5) {
        this._mediaService.getDistanceLearningMedia(this.editingMediaID).subscribe(distanceMedia => {
          distanceMedia.sessions != null ? this.talks = distanceMedia.sessions : this.talks = [];
          distanceMedia.attendanceRequirements != null ? this.attendanceRequirements = distanceMedia.attendanceRequirements : this.attendanceRequirements = [];
          let instructionsInput: HTMLTextAreaElement = document.querySelector("#distanceLearningInstructions");
          instructionsInput.value = distanceMedia.instructions;

        });
      }

      else {
        this.filePath = data.path;
      }

      // Get the channels that this media item is added on
      this._mediaService.getChannelsOfMedia(this.editingMediaID).subscribe(data => {
        this.uploadChannels = data;

        for (let channel of data) {
          let rel = this.channelRelationships.find(ele => ele.childId == channel.channelID);
          if (rel) {
            let parent = this.allChannels.find(ele => ele.channelID == rel.parentId);
            this.uploadChannelText.push({ 'parent': parent.title, 'text': channel.title });
          } else {
            this.uploadChannelText.push({'text': channel.title })
          }
        }
        this.selectedChannelsSubject.next(this.uploadChannels);
      })

      // Get this media item's keywords
      this._keywordService.getKeywordsOfMedia(this.editingMediaID).subscribe(data => {
        for (let keyword of data) {
          this.keywordStrings.push(keyword.word);
        }
      })

      // Get this media item's flags
      if (data.flaggedLocations != null) {
        for (let location of data.flaggedLocations.split(",")) {
          this.locationFlags.push(location.trim());
        }
      }
      if (data.flaggedJobCodes != null) {
        for (let jobCode of data.flaggedJobCodes.split(",")) {
          this.jobCodeFlags.push(jobCode.trim());
        }
      }
      if (data.flaggedJobGroups != null) {
        for (let jobGroup of data.flaggedJobGroups.split(",")) {
          this.jobGroupFlags.push(jobGroup.trim())
        }
      }
      if (data.flaggedDepartments != null) {
        for (let department of data.flaggedDepartments.split(",")) {
          this.departmentFlags.push(department.trim());
        }
      }
      if (data.flaggedCostCenters != null) {
        for (let costCenter of data.flaggedCostCenters.split(",")) {
          this.costCenterFlags.push(costCenter.trim());
        }
      }

    })
  }

  fileExists(filePath: string): Observable<boolean> {
    return this._http.get(filePath)
      .pipe(
        map(response => {
          return true;
        }),
        catchError(error => {
          //console.log(error);
          if (error.status != 200) {
            return of(false);
          } else {
            return of(true);
          }
        })
      );
  }

  ToggleFlaggedAllUsers(value: boolean) {
    this.mediaIsFlaggedForAll = value;
  }

  async Submit() {
    this.submissionMsg = "";
    //Reset the error text to empty
    this.errorTexts.splice(0);
    //Make sure there is a title
    if (this.curTitle == "") {
      this.errorTexts.push("You cannot upload media without a title!");
    }
    //If this is a non-tech talk, make sure there is a path to a media file
    if (this.selectedMediaType < 5) {
      if (this.filePath == "") {
        this.errorTexts.push("You cannot upload this media without a path to the media file");
      }
    }

    //If this is a tech talk, make sure it has at least one link
    //if (this.selectedMediaType == 5) {
    //  if (this.talks.length < 1) {
    //    this.errorTexts.push("You cannot upload a Distance learning session ");
    //  }
    //}

    //If this is an external link, make sure a link has been provided
    if (this.selectedMediaType == 6) {
      if (this.urlPath == '') {
        this.errorTexts.push("You cannot upload this media without a URL!");
      }
    }

    // If there was an error with the thumbnail path, substitute the default image in
    if (this.thumbNailPathError) {
      this.thumbPath = this.defaultThumbnail;
    }

    //Only proceed if there are no errors
    if (this.errorTexts.length < 1) {

      //Create a new media variable with all the necessary data
      let newMedia: Media = {
        title: this.curTitle,
        description: this.curDescription,
        thumbnailPath: this.thumbPath,
        createdAt: new Date(),
        path: this.filePath,
        mediaTypeID: this.selectedMediaType,
        mediaStatus: "A",
        commentingEnabled: this.commentingEnabled,
        flaggedAllUsers: this.mediaIsFlaggedForAll
      }


      // Add Flags

      // Cost center flags
      if (this.costCenterFlags.length > 0) {
        let flaggedCostCenterString = "";
        for (let flag of this.costCenterFlags) {
          flaggedCostCenterString += flag + ", "
        }

        // shave off end space and comma
        flaggedCostCenterString = flaggedCostCenterString.substring(0, flaggedCostCenterString.length - 2);

        newMedia.flaggedCostCenters = flaggedCostCenterString;
      } else { newMedia.flaggedCostCenters = null }

      // Location flags
      if (this.locationFlags.length > 0) {
        let locationString = "";
        for (let flag of this.locationFlags) {
          locationString += flag + ", "
        }

        // shave off end space and comma
        locationString = locationString.substring(0, locationString.length - 2);

        newMedia.flaggedLocations = locationString;
      } else { newMedia.flaggedLocations = null }

      // Job code flags
      if (this.jobCodeFlags.length > 0) {
        let jobCodeString = "";
        for (let flag of this.jobCodeFlags) {
          jobCodeString += flag + ", "
        }

        // shave off end space and comma
        jobCodeString = jobCodeString.substring(0, jobCodeString.length - 2);

        newMedia.flaggedJobCodes = jobCodeString;
      } else { newMedia.flaggedJobCodes = null }

      // job group flags
      if (this.jobGroupFlags.length > 0) {
        let jobGroupString = "";
        for (let flag of this.jobGroupFlags) {
          jobGroupString += flag + ", "
        }

        // shave off end space and comma
        jobGroupString = jobGroupString.substring(0, jobGroupString.length - 2);

        newMedia.flaggedJobGroups = jobGroupString;
      } else { newMedia.flaggedJobGroups = null }

      // department flags
      if (this.departmentFlags.length > 0) {
        let departmentString = "";
        for (let flag of this.departmentFlags) {
          departmentString += flag + ", "
        }

        // shave off end space and comma
        departmentString = departmentString.substring(0, departmentString.length - 2);

        newMedia.flaggedDepartments = departmentString;
      } else { newMedia.flaggedDepartments = null }

      //External videos have a different path variable
      if (this.selectedMediaType == 6) {
        newMedia.path = this.urlPath;
      }

      if (!this.editing) {

        this._mediaService.submitNewMedia(newMedia).subscribe(m => {
          let mediaID = m.mediaID
          let title = m.title

          let change = "Added Media"
          this.logChanges(title, change, mediaID, null, null)
          this.UploadKeywords(m.mediaID);
          //Add the new media to all of the channels you have selected
          for (let i = 0; i < this.uploadChannels.length; ++i) {
            this._channelservice.addChannelMedia(this.uploadChannels[i].channelID, m).subscribe(cm => { }, error => { console.log(error) });
          }

          // Distance learning - WORKS
          if (this.selectedMediaType == 5) {
            newMedia.path = "/NA";

            let instructionsInput: HTMLInputElement = document.querySelector("#distanceLearningInstructions");

            let instructions = instructionsInput.value
            let attendanceRequirements = this.attendanceRequirements;
            let sessions = this.talks;

            for (let session of sessions) {
              session.mediaID = m.mediaID;
            }

            // Construct attendance requirements
            for (let requirement of attendanceRequirements) {
              requirement.mediaId = m.mediaID;
            };

            let distanceLearningMedia: DistanceLearningMedia = {
              mediaId: m.mediaID,
              instructions: instructions,
              sessions: sessions,
              attendanceRequirements: attendanceRequirements
            }

            this._mediaService.AddNewDistanceLearningMedia(distanceLearningMedia).subscribe(response => {
              this.showSuccessBanner(this.uploadSuccessMessage, 10000);
              this.clearForm();

            })

          } else {

            this.showSuccessBanner(this.uploadSuccessMessage, 10000);
            this.clearForm();
          }

        });
      } else {

        // Submit edit
        let mediaID = -1
        let title = ""
        await new Promise((resolve, reject) => {
          newMedia.mediaID = this.editingMediaID;
          newMedia.createdAt = this.editingMediaItem.createdAt;
          newMedia.flaggedAllUsers = this.mediaIsFlaggedForAll ? this.mediaIsFlaggedForAll : null;
          newMedia.mediaStatus = this.isEditingMediaRetired ? "R" : "A";
          mediaID = this.editingMediaID
          title = newMedia.title
          this._mediaService.updateMedia(this.editingMediaID, newMedia).subscribe(event => {
            resolve()
          });
        })
        let change = "Updated Media"
        await this.logChanges(title, change, mediaID, this.mediaBeforeEdit, null)
        this.showSuccessBanner(this.editSuccessMessage, 10000);

        // Handle updates to channels

        // New channels added
        for (let addedChannel of this.addedChannels) {
          await new Promise((resolve, reject) => {
            change = "Added Media: ".concat(newMedia.title)
            title = addedChannel.title
            mediaID = addedChannel.channelID
            resolve()
          })
          await this.logChanges(title, change, mediaID, newMedia, addedChannel, "Channel")
          this._channelservice.addChannelMedia(addedChannel.channelID, newMedia).subscribe(data => { }, error => { console.log(error) })
        }

        // Channels removed
        for (let removedChannel of this.removedChannel) {
          await new Promise((resolve, reject) => {
            change = "Removed Media: ".concat(newMedia.title)
            title = removedChannel.title
            mediaID = removedChannel.channelID
            resolve()
          })
          await this.logChanges(title, change, mediaID, newMedia, removedChannel, "Channel")
          this._channelservice.removeChannelMedia(removedChannel.channelID, newMedia.mediaID).subscribe(data => { }, error => { console.log(error) })
        }

        // Handle updates to keywords

        for (let addedKeyword of this.addedKeywords) {
          this._keywordService.getKeyword(addedKeyword).subscribe(keyword => {
            //If the keyword is not already in the database
            if (keyword == null) {
              //Create new keyword in DB and grab new ID
              let newKeyword: Keyword = {
                id: 0,
                word: addedKeyword
              };
              this._keywordService.createNewKeyword(newKeyword).subscribe(kw => {
                this._keywordService.associateKeywordAndMedia(newMedia.mediaID, kw.id).subscribe();
              },
                error => { console.log(error) });
            }
            else {
              // the keyword already existed
              this._keywordService.associateKeywordAndMedia(newMedia.mediaID, keyword.id).subscribe();
            }
          })
        }

        for (let removedKeyword of this.removedKeywords) {
          this._keywordService.getKeyword(removedKeyword).subscribe(dbK => {
            this._keywordService.removeKeywordMedia(dbK.id, newMedia.mediaID).subscribe();
          })
        }

        // Handle updates to Distance Learning media types
        if (this.selectedMediaType == 5) {

          let instructionsInput: HTMLInputElement = document.querySelector("#distanceLearningInstructions");

          let instructions = instructionsInput.value
          let attendanceRequirements = this.attendanceRequirements;
          let sessions = this.talks;

          for (let session of sessions) {
            session.mediaID = this.editingMediaID;
          }

          // Construct attendance requirements
          for (let requirement of attendanceRequirements) {
            requirement.mediaId = this.editingMediaID;
          };

          let distanceLearningMedia: DistanceLearningMedia = {
            mediaId: this.editingMediaID,
            instructions: instructions,
            sessions: sessions,
            attendanceRequirements: attendanceRequirements
          }
          console.log(distanceLearningMedia);
          this._mediaService.updateDistanceLearningMedia(distanceLearningMedia).subscribe(response => {

          });
        }

      }

    }
    //Scroll to the top of the page
    window.scrollTo(0, 0);
  }

  toggleMediaRetired() {
    let modalMessage = this.isEditingMediaRetired ? "Are you sure you want to un-retire this media item?" : "Are you sure you want to retire this media item?";

    this.confirmModal(modalMessage).subscribe(response => {
      if (response) {
        this.isEditingMediaRetired = !this.isEditingMediaRetired;
      }
    })
  }

  toggleCommentingEnabled() {
    let modalMessage = this.commentingEnabled ? "Are you sure you want to disable comments for this media item?" : "Are you sure you want to enable comments for this media item?"

    this.confirmModal(modalMessage).subscribe(response => {
      if (response) {
        this.commentingEnabled = !this.commentingEnabled;
      }
    })
  }

  showSuccessBanner(message: string, duration: number) {
    this.submissionMsg = message;
    setTimeout(() => this.submissionMsg = "", duration);
  }

  clearForm() {
    // This toggles all of the channels off
    this.submissionSubject.next(false);

    // Ensure all the fields are cleared
    this.uploadChannels = [];
    this.uploadChannelText = [];
    this.curDescription = "";
    this.curTitle = "";
    this.thumbPath = this.defaultThumbnail
    if (!this.defaultThumbnailExists) {
      this.thumbNailActive = false;
      this.throwThumbnailError("Default thumbnail '" + this.defaultThumbnail + "' not found.  Please enter a valid thumbnail image path", true);
    } else {
      this.thumbnailSource = this.sitePath + this.defaultThumbnail;
      this.thumbNailActive = true;
    }

    this.locationFlags = [];
    this.jobCodeFlags = [];
    this.jobGroupFlags = [];
    this.departmentFlags = [];
    this.costCenterFlags = [];

    this.filePath = "";
    this.urlPath = "";

    // TODO: distance learning stuff
    if (this.selectedMediaType == 5) {
      this.attendanceRequirements = [];
      this.talks = [];

      let instructionsInput: HTMLTextAreaElement = document.querySelector("#distanceLearningInstructions");
      let attendanceInput: HTMLInputElement = document.querySelector("#distanceLearningAttendanceRequirements");
      let eventLinkInput: HTMLInputElement = document.querySelector("#urlInput");
      let startDateInput: HTMLInputElement = document.querySelector("#startDateInput");
      let startTimeInput: HTMLInputElement = document.querySelector("#startTimeInput");
      let endDateInput: HTMLInputElement = document.querySelector("#endDateInput");
      let endTimeInput: HTMLInputElement = document.querySelector("#endTimeInput");
      let passwordCheckbox: HTMLInputElement = document.querySelector("#passcodeProtectedCheckbox");

      eventLinkInput.value = "";
      attendanceInput.value = "";
      instructionsInput.value = "";
      startDateInput.value = "";
      startTimeInput.value = "";
      endDateInput.value = "";
      endTimeInput.value = "";
      passwordCheckbox.checked = false;
      this.distanceLearningPasscodeFormActive = false;
    }
  }

  AddChannel(newChannel: Channel) {
    //Add the channel if it is not currently in the array
    this.uploadChannels.push(newChannel);
    if (newChannel.parentId != null) {
      let parentChannel = this.allChannels.find(ele => ele.channelID == newChannel.parentId);
      this.uploadChannelText.push({"parent": parentChannel.title, "text": newChannel.title});
    } else {
      this.uploadChannelText.push({"parent": null, "text": newChannel.title});
    }
    if (this.editing) {
      // If this channel was removed in editing, but then added back
      let ind = this.removedChannel.findIndex(ele => ele.channelID == newChannel.channelID)
      if (ind != -1) {
        this.removedChannel.splice(ind, 1);
      } else {
        this.addedChannels.push(newChannel);
      }
    }
  }

  RemoveChannel(channel: Channel) {
    //Remove the channel at the specified index from the array
    let index = this.uploadChannels.findIndex(ele => ele.channelID == channel.channelID);
    this.uploadChannels.splice(index, 1);

    // Also have to remove the text from text array
    let ind = this.uploadChannelText.findIndex(ele => ele['text'] == channel.title);
    this.uploadChannelText.splice(ind, 1);

    if (this.editing) {

      // If we added this channel during editing
      let ind = this.addedChannels.findIndex(ele => ele.channelID == channel.channelID)
      if (ind != -1) {
        this.addedChannels.splice(ind, 1);
      } else {
        this.removedChannel.push(channel);
      }
    }
  }

  onThumbnailAdded(event: HTMLInputElement) {
    this.thumbNailErrorVisible = false;
    var path = event.value
    this.fileExists(this.sitePath + path).subscribe(exists => {
      if (exists) {
        this.thumbnailSource = this.sitePath + path;
        this.thumbNailActive = true;
        this.thumbNailPathError = false;
      } else {
        if (this.defaultThumbnailExists) {
          this.throwThumbnailError("image: '" + path + "' not found, thumbnail replaced with default");
          this.thumbPath = this.defaultThumbnail;
          this.thumbnailSource = this.sitePath + this.defaultThumbnail;
        } else {
          this.throwThumbnailError("image: '" + path + "' not found, please enter a valid thumbnail image path", true);
        }
        this.thumbNailActive = this.defaultThumbnailExists;
      }
    })

  }

  AddTalkLink() {

    let urlInputer: HTMLInputElement = document.querySelector("#urlInput");
    let startDateInput: HTMLInputElement = document.querySelector("#startDateInput");
    let startTimeInput: HTMLInputElement = document.querySelector("#startTimeInput");
    let endDateInput: HTMLInputElement = document.querySelector("#endDateInput");
    let endTimeInput: HTMLInputElement = document.querySelector("#endTimeInput");
    let passwordProtectedInput: HTMLInputElement = document.querySelector("#passcodeProtectedCheckbox");

    let url = urlInputer.value;
    let startDate = startDateInput.value;
    let startTime = startTimeInput.value;
    let endDate = endDateInput.value;
    let endTime = endTimeInput.value;
    let passwordProtected = passwordProtectedInput.checked;
    let password = "";

    if (passwordProtected) {
      let passwordField: HTMLInputElement = document.querySelector("#passcodeInput");
      password = passwordField.value;
    }

    if (url != "" && startDate != "" && startTime != "" && endDate != "" && endTime != "") {

      //let startDateComparator = new Date(startDate + "T" + startTime + ":00");
      //let endDateComparator = new Date(endDate + "T" + endTime + ":00");

      let session: DistanceLearningSession = {
        id: 0,
        mediaID: 0,
        startTime: new Date(startDate + "T" + startTime + ":00"),
        endTime: new Date(endDate + "T" + endTime + ":00"),
        urlPath: url, 
        isPasswordProtected: passwordProtected,
        password: passwordProtected ? password : null
      }

      this.talks.push(session);

      // Clear input field
      urlInputer.value = "";
      startDateInput.value = "";
      startTimeInput.value = "";
      endDateInput.value = "";
      endTimeInput.value = "";
      passwordProtectedInput.checked = false;
      this.distanceLearningPasscodeFormActive = false;
    }

  }

  RemoveTalkLink(index: number) {
    //Remove the item at the specified index
    this.talks.splice(index, 1);
  }

  onDistanceLearningSessionDeleted(session: DistanceLearningSession) {
    let ind = this.talks.findIndex(ele => ele.id == session.id);
    if (ind != -1) {
      this.talks.splice(ind, 1);
    }
  }

  addAttendanceRequirement(target: HTMLInputElement) {
    let requirement: DistanceLearningAttendanceRequirement = {
      id: 0,
      mediaId: 0,
      description: target.value
    };
    this.attendanceRequirements.push(requirement);
    target.value = "";
  }

  deleteAttendanceRequirement(index: number) {
    this.attendanceRequirements.splice(index, 1);
  }

  SetMediaType(type: any) {
    //console.log(type.target.selectedIndex);
    this.selectedMediaType = type.target.selectedIndex + 1;
  }

  ClearFields() {
    /*Called after a submission to clear all the input fields*/
    this.curTitle = "";
    this.curDescription = "";
    this.filePath = "";
    this.urlPath = "";
    this.thumbPath = "";
    this.uploadChannels.splice(0);
    this.talks.splice(0);
    this.keywordStrings.splice(0);
  }


  async logChanges(title: string, change: string, mediaID: number, media: Media, channel: Channel, cata = "Media") {
    //console.log(mediaID)
    //console.log([title, change, mediaID]);
    let user = this.currentUser
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
    await new Promise((resolve, reject) => {
      this._adminAuditService.createEntry(entry).subscribe(x => {
        if (cata === "Media") {
          const changedMedia: ChangedMedia =
          {
            changeID: x.id,
            mediaID: mediaID
          }
          if (media != null) {
            changedMedia.title = media.title
            changedMedia.createdAt = media.createdAt
            changedMedia.description = media.description
            changedMedia.flaggedAllUsers = media.flaggedAllUsers
            changedMedia.flaggedCostCenters = media.flaggedCostCenters
            changedMedia.flaggedDepartments = media.flaggedDepartments
            changedMedia.flaggedJobCodes = media.flaggedJobCodes
            changedMedia.flaggedJobGroups = media.flaggedJobGroups
            changedMedia.flaggedLocations = media.flaggedLocations
            changedMedia.mediaStatus = media.mediaStatus
            changedMedia.mediaTypeID = media.mediaTypeID
            changedMedia.path = media.path
            changedMedia.thumbnailPath = media.thumbnailPath

          }
          this._changedMediaService.postChangedMedia(changedMedia).subscribe(x => {
            resolve()
          })
        } else {
          const changed: ChangedChannel =
          {
            changeID: x.id,
            channelID: channel.channelID,
            title: channel.title,
            modifiedID: media.mediaID
          }
          this._changedChannelService.postChangedChannel(changed).subscribe(x => {
            resolve()
          })
        }
      })
    })
  }

  AddKeywordString(value: string) {
    //Add the keyword if it is not currently in the array
    if (this.keywordStrings.indexOf(value) < 0) {
      this.keywordStrings.push(value);
      if (this.editing) {
        let ind = this.removedKeywords.findIndex(ele => ele == value);
        if (ind != -1) {
          this.removedKeywords.splice(ind, 1);
        } else {
          this.addedKeywords.push(value);
        }
      }
    }
  }

  RemoveKeywordString(keyword: string) {
    //Remove at specified index
    let index = this.keywordStrings.findIndex(ele => ele == keyword);
    this.keywordStrings.splice(index, 1);
    if (this.editing) {
      let ind = this.addedKeywords.findIndex(ele => ele == keyword);
      if (ind != -1) {
        this.addedKeywords.splice(ind, 1);
      } else {
        this.removedKeywords.push(keyword);
      }
    }
  }

  UploadKeywords(mID: number) {
    //console.log("Adding keywords to " + mID);
    for (let i = 0; i < this.keywordStrings.length; ++i) {
      let newKeyword: Keyword = {
        id: 0,
        word: this.keywordStrings[i]
      };
      this._keywordService.getKeyword(newKeyword.word).subscribe(dbK => {
        //If the keyword is not already in the database
        if (dbK == null) {
          //Create new keyword in DB and grab new ID
          this._keywordService.createNewKeyword(newKeyword).subscribe(kw => {
            //console.log("NOT IN DB: " + kw);
            this._keywordService.associateKeywordAndMedia(mID, kw.id).subscribe();
          },
            error => { console.log(error) });
        }
        //If the keyword already exists in the db
        else {
          //console.log("IN DB ALREADY: " + dbK);
          this._keywordService.associateKeywordAndMedia(mID, dbK.id).subscribe();
        }
      })
    }
    //Clear the keywords
    this.keywordStrings.splice(0);
  }

  onLocationFlagSelected(value) {
    this.locationFlags.push(value);
    this.locationAutocomplete.clear();
  }

  onJobCodeFlagSelected(value) {
    this.jobCodeFlags.push(value);
    this.jobCodesAutocomplete.clear();
  }

  onJobGroupFlagSelected(value) {
    this.jobGroupFlags.push(value);
    this.jobGroupsAutocomplete.clear();
  }

  onDepartmentFlagSelected(value) {
    this.departmentFlags.push(value);
    this.departmentsAutocomplete.clear();
  }

  onCostCenterFlagSelected(value) {
    this.costCenterFlags.push(value);
    this.costCentersAutocomplete.clear();
  }

  addLocationFlag(input: HTMLInputElement) {
    this.locationFlags.push(input.value);
    input.value = "";

  }
  addJobCodeFlag(input: HTMLInputElement) {
    this.jobCodeFlags.push(input.value);
    input.value = "";

  }
  addJobGroupFlag(input: HTMLInputElement) {
   this.jobGroupFlags.push(input.value)
    input.value = "";

  }
  addDepartmentFlag(input: HTMLInputElement) {
    this.departmentFlags.push(input.value);
    input.value = "";

  }
  addCostCenterFlag(input: HTMLInputElement) {
    this.costCenterFlags.push(input.value);
    input.value = "";

  }

  removeLocationFlag(flag: string) {
    let index = this.locationFlags.findIndex(ele => ele == flag);
    this.locationFlags.splice(index, 1);
  }
  removeJobCodeFlag(flag: string) {
    let index = this.jobCodeFlags.findIndex(ele => ele == flag);
    this.jobCodeFlags.splice(index, 1);
  }
  removeJobGroupFlag(flag: string) {
    let index = this.jobGroupFlags.findIndex(ele => ele == flag);
    this.jobGroupFlags.splice(index, 1);
  }
  removeDepartmentFlag(flag: string) {
    let index = this.departmentFlags.findIndex(ele => ele == flag);
    this.departmentFlags.splice(index, 1);
  }
  removeCostCenterFlag(flag: string) {
    let index = this.costCenterFlags.findIndex(ele => ele == flag);
    this.costCenterFlags.splice(index, 1);
  }

  onFilePathEntered(target: HTMLInputElement) {
    let banner = document.getElementById("fileNotificationBanner");
    banner.innerHTML = "";
    this.fileExists(this.sitePath + target.value).subscribe(exists => {
      if (exists) {
        banner.innerHTML = "<i>File found!</i>";
        banner.style.color = "green";
      } else {
        banner.innerHTML = "<i>File: '" + target.value + "' not found.  Please try another file path</i>";
        banner.style.color = "red";
      }
    })

    // Toggle the banner message off after some duration
    //setTimeout(() => {
    //  banner.innerHTML = "";
    //  banner.style.color = "";
    //}, 10000); // 10s
  }

  onKeywordSelected(event) {
    this.AddKeywordString(event);

    this.keywordAutocomplete.clear();
  }

  onKeywordEnterHit(event) {
    event.preventDefault();
    this.AddKeywordString(event.target.value);
    this.keywordAutocomplete.clear();
    event.preventDefault();
  }

  //Confirm deleting or approving comment modal
  confirmModal(message): Observable<any> {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { title: message };

    const dialogRef = this._matDialog.open(UserSaveModalComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  convertSessionDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    var newString = moment(newDate).format("MMM Do, YYYY LT");
    return newString;
  }

 
}
