import { Component, OnInit, HostListener } from '@angular/core';
import { MediaService } from '../services/media.service';
import { MediaTypeService } from '../services/media-type.service';
import { ChannelService } from '../services/channel.service';
import { KeywordService } from '../services/keyword.service';
import { Media } from '../models/media';
import { Channel } from '../models/channel';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MediaType } from '../models/media-type';
import { Keyword } from '../models/keyword';
import { DistanceLearningSession } from '../models/distance-learning-session';
import { ComponentCanDeactivate } from '../guards/unsaved-changes.guard';
import { Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { isNull } from 'util';
import { ChangedMedia } from '../models/changed-media';
import { ChangedMediaService } from '../services/changed-media.service';
import { User } from '../models/user';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';

/**
 * Author: Shawn Pryde
 * Date: 11/14/2020
 * */
@Component({
  selector: 'app-media-admin-page',
  templateUrl: './media-admin-page.component.html',
  styleUrls: ['./media-admin-page.component.css']
})
export class MediaAdminPageComponent implements OnInit, ComponentCanDeactivate {

  /* Search vars */
  searchText: string = '';
  hasSearchError = false
  searchErrorText: string = '';
  noResults = false
  returnedMedia: Media[] = []
  errorTexts: String[] = [];

  // pagination
  perPageCount: number = 10
  p: number = 1;
  indexForPage: number = 0;

  /* Media editing vars */
  // the media that is currently being edited
  mediaHasBeenSelected = false;
  selectedMediaBeforeEdit: Media
  selectedMedia: Media
  currentUser: User
  selectableChannels: Channel[];
  channelsOfSelected: Channel[] = [];
  channelsOfSelectedBeforeEdit: Channel[] = [];
  mediaIsRetired = false;
  talks: DistanceLearningSession[] = [];
  talksBeforeEdit: DistanceLearningSession[] = [];
  // the list keyword values associated with this media item
  keywordStrings: string[] = [];
  keywordStringsBeforeEdit: string[] = [];
  // flags 
  mediaIsFlaggedForAll = false;
  allFlagBeforeEdit = false;


  SitePath: string = environment.SitePath;

  // This is a direct translation of the media types present in the database
  mediaTypes: MediaType[]

  constructor(
    private _mediaService: MediaService,
    private _router: Router,
    private _mediaTypeService: MediaTypeService,
    private _changedMediaService: ChangedMediaService,
    private _channelService: ChannelService,
    private _keywordService: KeywordService,
    private _adminAuditService: AdminAuditLogService,
    private _changedChannelService: ChangedChannelService,
    private _userService: UserService,
  ) { }

  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)
    //console.log(this._router.parseUrl(this._router.url).queryParams);

    // initialize list of media types
    this._mediaTypeService.getAllMediaTypes().subscribe(allTypes => {
      this.mediaTypes = allTypes;
    });

    //Fill the array of selectable channels
    this._channelService.getAllChannels().subscribe(data => {
      this.selectableChannels = data;
    }, error => { console.log(error) });

    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    }, error => {console.log(error)});
    // fill search
    /*
    this._mediaService.getAllItems().subscribe(data => {
      this.returnedMedia = data;
    }, error => { console.log(error) });//*/
  }

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    // we're ok if no media is currently being changed
    if (!this.mediaHasBeenSelected) { return true; }
    /*
    console.log(this.selectedMediaBeforeEdit);
    console.log(this.selectedMedia);
    console.log(this.channelsOfSelected);
    console.log(this.channelsOfSelectedBeforeEdit);
    console.log(this.keywordStrings);
    console.log(this.keywordStringsBeforeEdit);//*/

    /// We have unsaved changes if...
    // ... any arrays are not the same length as they started 
    if ((this.keywordStrings.length != this.keywordStringsBeforeEdit.length) ||
      (this.channelsOfSelected.length != this.channelsOfSelectedBeforeEdit.length)) {
      return false;
    }
    // ... any channel id's differ
    for (var i = 0; i < this.channelsOfSelected.length; i++) {
      if (this.channelsOfSelected[i].channelID != this.channelsOfSelectedBeforeEdit[i].channelID) {
        return false;
      }
    }
    // ... any keywords differ
    for (var i = 0; i < this.keywordStrings.length; i++) {
      if (this.keywordStrings[i] != this.keywordStringsBeforeEdit[i]) {
        return false;
      }
    }
    // ... the media straight up don't match
    if (this.mediaHasBeenSelected && !this.mediaAreEqual(this.selectedMediaBeforeEdit, this.selectedMedia)) {
      return false
    }
    // otherwise, we're good
    return true
  }

  mediaAreEqual(m1: Media, m2: Media) {
    if ((m1.mediaID != m2.mediaID) ||
      (m1.title != m2.title) ||
      (m1.description != m2.description) ||
      (m1.thumbnailPath != m2.thumbnailPath) ||
      (m1.path != m2.path) ||
      (m1.flaggedCostCenters != m2.flaggedCostCenters) ||
      (m1.flaggedDepartments != m2.flaggedDepartments) ||
      (m1.flaggedJobCodes != m2.flaggedJobCodes) ||
      (m1.flaggedJobGroups != m2.flaggedJobGroups) ||
      (m1.flaggedLocations != m2.flaggedLocations) ||
      (m1.mediaStatus != m2.mediaStatus)) {
      return false;
    }
    return true;
  }

  encodeSearchTerm(): string {
    return encodeURIComponent(this.searchText);
  }

  async logChanges(title: string, change: string, mediaID: number, media: Media, channel: Channel, cata = "Media") {
    console.log(mediaID)
    console.log([title, change, mediaID]);
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
    console.log(entry)
    await new Promise((resolve, reject) => {
      this._adminAuditService.createEntry(entry).subscribe(x => {
        if (cata === "Channel") {
          const changed: ChangedChannel =
          {
            changeID: x.id,
            channelID: channel.channelID,
            title: channel.title,
          }
          changed.modifiedID = media.mediaID
          console.log("the info")
          console.log(changed)
          console.log(media)
          this._changedChannelService.postChangedChannel(changed).subscribe(x => {
            resolve()
          })
        }
        else if (cata === "Media") {
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
            resolve()
          })
        }
      })
    })
  }


  /**
   * Getter for the string name of a media type based on its ID
   * @param typeID
   */
  mediaTypeString(typeID: number): string {
    if (this.mediaTypes === undefined || this.mediaTypes === null) {
      return "";
    }
    var associatedMediaType = this.mediaTypes.find(obj => { return obj.id == typeID });
    return associatedMediaType.name;
  }

  /**
   * Performs a search then
   * sets the search results on this page
   * */
  searchMedia(): void {
    // Reset values on new search
    this.noResults = false
    this.hasSearchError = false
    this.selectedMedia = null;

    if (this.searchText == "" || this.searchText == null) {
      this.hasSearchError = true
      this.searchErrorText = "Search Requires Input";
      return;
    }


    // perform the search
    this._mediaService.searchForMediaByTitle(this.searchText, true).subscribe(res => {
      if (res.length > 0) {
        this.returnedMedia = res
      }
      else {
        this.noResults = true
        this.hasSearchError = true
        this.searchErrorText = "Could not find any media";
        this.returnedMedia = []
      }
    })
    //this._router.navigate([this.SitePath+"admin/media"], { queryParams: { search: this.encodeSearchTerm() }});
  }

  /**
   * Establish a new media item to edit
   * @param mSelected
   */
  selectMedia(mSelected: Media) {
    this.mediaHasBeenSelected = true;
    this.selectedMedia = mSelected;
    this.selectedMediaBeforeEdit = Object.assign({}, mSelected); //< deepcopy
    //initialize channels of selected media
    this._mediaService.getChannelsOfMedia(mSelected.mediaID).subscribe(result => {
      this.channelsOfSelected = result.slice(); //perform a slice to keep all arrays distinct
      this.channelsOfSelectedBeforeEdit = result.slice();
      // remove these channels from those which are displayed
      let newSelectableChannels: Channel[] = [];
      for (var i = 0; i < this.selectableChannels.length; i++) {
        if (this.channelsOfSelected.find(obj => { return obj.channelID == this.selectableChannels[i].channelID }) == null) {
          newSelectableChannels.push(this.selectableChannels[i]);
        }
      }
      this.selectableChannels = newSelectableChannels;
    })
    // check flagged status
    if (this.selectedMedia.flaggedAllUsers != null) {
      this.mediaIsFlaggedForAll = this.selectedMedia.flaggedAllUsers;
      this.allFlagBeforeEdit = this.selectedMedia.flaggedAllUsers;
    }
    // check retired status
    this.mediaIsRetired = !(mSelected.mediaStatus.toUpperCase() == "A");
    // initialize keyword strings
    this._keywordService.getKeywordsOfMedia(mSelected.mediaID).subscribe(kws => {
      this.keywordStrings = [];
      this.keywordStringsBeforeEdit = [];
      for (var i = 0; i < kws.length; i++) {
        this.keywordStrings.push(kws[i].word);
        this.keywordStringsBeforeEdit.push(kws[i].word);
      }
    })
    // get tech talk sessions if applicable
    this._mediaService.getDistanceLearningSessions(mSelected.mediaID).subscribe(data => {
      this.talks = data.slice();
      this.talksBeforeEdit = data.slice();
    });
  }

  /**
   * Add a channel to the selected media item
   * @param newChannel
   */
  AddChannel(newChannel: Channel) {
    let change = "Added Media: ".concat(this.selectedMedia.title)
    let mediaID = newChannel.channelID
    let title = newChannel.title
    this.logChanges(title, change, mediaID, this.selectedMedia, newChannel, "Channel")
    //Add the channel if it is not currently in the array
    if (this.channelsOfSelected.indexOf(newChannel) < 0) {
      this.channelsOfSelected.push(newChannel);
      let indexOfSelectable = this.selectableChannels.indexOf(newChannel);
      if (indexOfSelectable != -1) {
        this.selectableChannels.splice(indexOfSelectable, 1);
      }
    }
    this.saveChanges()
  }

  /**
   * Remove a channel from the selected media item
   * @param index 
   */
  RemoveChannel(index: number) {
    let change = "Removed Media: ".concat(this.selectedMediaBeforeEdit.title)
    let mediaID = this.selectableChannels[index].channelID
    let title = this.selectableChannels[index].title
    this.logChanges(title, change, mediaID, this.selectedMediaBeforeEdit, this.selectableChannels[index], "Channel")
    var deleted = this.channelsOfSelected.splice(index, 1);
    this.selectableChannels.push(deleted[0]); 
    this.saveChanges()
  }

  ToggleFlaggedAllUsers(value: boolean) {
    this.mediaIsFlaggedForAll = value;
  }
  ToggleRetired(value: boolean) {
    let change = "Retired Media"
    let mediaID = this.selectedMedia.mediaID
    let title = this.selectedMediaBeforeEdit.title
    this.logChanges(title, change, mediaID, this.selectedMediaBeforeEdit, null)
    this.mediaIsRetired = value;
  }

  //
  // Keyword stuff
  //
  
  AddKeywordString() {
    let inputer: HTMLInputElement = document.querySelector("#keywordInput");
    let word = inputer.value;
    //Add the word if it is not currently in the array
    if (this.keywordStrings.indexOf(word) < 0) {
      this.keywordStrings.push(word);
      inputer.value = "";
    }
  }

  RemoveKeywordString(index: number) {
    this.keywordStrings.splice(index, 1);
  }

  //
  // Tech Talk stuff
  //
  AddTalkLink() {
    let urlInputer: HTMLInputElement = document.querySelector("#urlInput");
    let dateInputer: HTMLInputElement = document.querySelector("#dateInput");
    let timeInputer: HTMLInputElement = document.querySelector("#timeInput");
    if (urlInputer != null) {
      let newLink = urlInputer.value;
      if (newLink != "" && timeInputer.value != "" && dateInputer.value != "") {
        let newTalk: DistanceLearningSession = {
          id: 0,
          mediaID: this.selectedMedia.mediaID,
          startTime: new Date(dateInputer.value + 'T' + timeInputer.value + ':00'),
          endTime: new Date(dateInputer.value + 'T' + timeInputer.value + ':00'),
          urlPath: newLink
        }
        //If the talk is not already in the list, add it
        if (this.talks.indexOf(newTalk) < 0) {
          this.talks.push(newTalk);
          urlInputer.value = "";
          dateInputer.value = "";
          timeInputer.value = "";
        }
      }
    }
  }

  //Removes the session at the specified index
  RemoveTalkLink(index: number) {
    this.talks.splice(index, 1);
  }

  /**
   * Submits all changes of the selected media item
   * to the database
   * */
  async saveChanges() {
    window.scrollTo(0, 0);
    /* Make sure that we can save our changes */
    let c=0
    if (this.selectedMediaBeforeEdit.title != this.selectedMedia.title) {
      let change = "Updated Title"
      let mediaID = this.selectedMedia.mediaID
      let title = this.selectedMedia.title
      await this.logChanges(title, change, mediaID, this.selectedMediaBeforeEdit, null)
      c++
    }
    if (this.selectedMediaBeforeEdit.description != this.selectedMedia.description) {
      let change = "Updated Description"
      let mediaID = this.selectedMedia.mediaID
      let title = this.selectedMedia.title
      await this.logChanges(title, change, mediaID, this.selectedMediaBeforeEdit, null)
      c++
    }
    if (this.selectedMediaBeforeEdit.path != this.selectedMedia.path) {
      let change = "Updated Media Path"
      let mediaID = this.selectedMedia.mediaID
      let title = this.selectedMedia.title
      await this.logChanges(title, change, mediaID, this.selectedMediaBeforeEdit, null)
      c++
    }
    this.errorTexts.splice(0);
    if (this.selectedMedia.mediaTypeID == 5) {
      if (this.talks.length < 1) {
        this.errorTexts.push("Tech talks must have at least one session");
      }
    }

    if (this.errorTexts.length > 0)
    { return; }

    /* Make sure flags coincide with each other*/
    if (this.mediaIsFlaggedForAll) {
      this.selectedMedia.flaggedAllUsers = true;
    }
    else if (this.selectedMedia.flaggedCostCenters == null && this.selectedMedia.flaggedDepartments == null &&
      this.selectedMedia.flaggedJobCodes == null && this.selectedMedia.flaggedJobGroups == null && this.selectedMedia.flaggedLocations == null) {
      // flaggedAllUsers cannot be false under these circumstances
      this.selectedMedia.flaggedAllUsers = null;
    }
    /* update enabled status */
    this.selectedMedia.mediaStatus = this.mediaIsRetired ? "R" : "A";
    console.log(this.selectedMedia.mediaStatus);

    //
    /* update standard media values */
    //
    console.log(this.selectedMedia);
    this._mediaService.updateMedia(this.selectedMedia.mediaID, this.selectedMedia).subscribe();

    /* update channel relations */
    // any channels which were previosly associated but no longer are must be removed
    for (var i = 0; i < this.channelsOfSelectedBeforeEdit.length; i++) {
      if (this.channelsOfSelected.find(obj => { return obj.channelID == this.channelsOfSelectedBeforeEdit[i].channelID }) == null) {
        //console.log("Found a channel to remove: " + this.channelsOfSelectedBeforeEdit[i]);
        this._channelService.removeChannelMedia(this.selectedMedia.mediaID, this.channelsOfSelectedBeforeEdit[i].channelID).subscribe(data => { }
          , error => { console.log(error) });
      }
    }
    // any channels which were not previously present but are now must be added
    for (var i = 0; i < this.channelsOfSelected.length; i++) {
      if (this.channelsOfSelectedBeforeEdit.find(obj => { return obj.channelID == this.channelsOfSelected[i].channelID }) == null) {
        //console.log("Found a channel to add: " + this.channelsOfSelected[i]);
        this._channelService.addChannelMedia(this.channelsOfSelected[i].channelID, this.selectedMedia).subscribe(data => { }
          , error => { console.log(error) });
      }
    }

    /* Update Keywords */
    // keywords which are now part of the array which were not before should be added
    for (let i = 0; i < this.keywordStrings.length; ++i) {
      if (this.keywordStringsBeforeEdit.find(obj => { return obj == this.keywordStrings[i] }) == null) {
        let newKeyword: Keyword = {
          id: 0,
          word: this.keywordStrings[i]
        };
        this._keywordService.getKeyword(newKeyword.word).subscribe(dbK => {
          //If the keyword is not already in the database
          if (dbK == null) {
            //Create new keyword in DB and grab new ID
            this._keywordService.createNewKeyword(newKeyword).subscribe(kw => {
              this._keywordService.associateKeywordAndMedia(this.selectedMedia.mediaID, kw.id).subscribe();
            },
              error => { console.log(error) });
          }
          else {
            // the keyword already existed
            this._keywordService.associateKeywordAndMedia(this.selectedMedia.mediaID, dbK.id).subscribe();
          }
        })
      }
    }
    // keywords which are no longer part of the array should be removed
    for (let i = 0; i < this.keywordStringsBeforeEdit.length; ++i) {
      if (this.keywordStrings.find(obj => { return obj == this.keywordStringsBeforeEdit[i] }) == null) {
        this._keywordService.getKeyword(this.keywordStringsBeforeEdit[i]).subscribe(dbK => {
          this._keywordService.removeKeywordMedia(dbK.id, this.selectedMedia.mediaID).subscribe();
        })
      }
    }

    /* update tech talks if applicable */
    // any tech talks which were previously scheduled but no longer are must be removed
    for (var i = 0; i < this.talksBeforeEdit.length; i++) {
      if (this.talks.find(obj => { return obj.id == this.talksBeforeEdit[i].id }) == null) {
        this._mediaService.deleteDistanceLearningSession(this.talksBeforeEdit[i].id).subscribe(data => { }
          , error => { console.log(error) });
      }
    }
    // any tech talks which were not previously present but are now must be scheduled
    for (var i = 0; i < this.talks.length; i++) {
      if (this.talksBeforeEdit.find(obj => { return obj.id == this.talks[i].id}) == null) {
        this._mediaService.submitNewDistanceLearningSession(this.talks[i]).subscribe(data => { }
          , error => { console.log(error) });
      }
    }

    // deselect the media item
    this.mediaHasBeenSelected = false;
  }

  convertUTCDateToLocalDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toDateString();
  }

  /**
   * Change the page index of our search results table
   * @param p
   */
  updateIndexPage(p: number) {
    this.indexForPage = this.perPageCount * (p - 1)
  }
}
