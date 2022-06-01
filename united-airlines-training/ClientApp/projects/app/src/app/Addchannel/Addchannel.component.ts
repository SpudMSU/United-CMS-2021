import { Component, OnInit } from '@angular/core';
import { Media } from '../models/media';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { ActivatedRoute, Router } from '@angular/router';
import { MediaService } from '../services/media.service';
import { MediaTypeService } from '../services/media-type.service';
import { environment } from '../../environments/environment';
import { MediaType } from '../models/media-type';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { User } from '../models/user';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';

@Component({
  selector: 'app-add-channel',
  templateUrl: './Addchannel.component.html',
  styleUrls: ['./Addchannel.component.css'],
})
export class AddchannelComponent implements OnInit {
  ac: Channel
  inputField: string = "";
  inputid: number;
  searchText: string = '';
  noSearchInput = false
  noResults = false
  returnedMedia: Media[] = []
  mediaTypes: MediaType[]
  /*checked medias*/
  selectedMedia: Media[] = []
  baseChannels: Channel[]
  items: boolean
  errormessage: string

  currentUser: User

  SitePath: string = environment.SitePath;

  // pagination
  perPageCount: number = 10
  p: number = 1;
  indexForPage: number = 0;

  changedMedia: Media[] = []
     

  constructor(private _channelservice: ChannelService,
    private router: ActivatedRoute,
    private router1: Router,
    private _mediaTypeService: MediaTypeService,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedChannelService: ChangedChannelService,
    private _mediaService: MediaService) { }

  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    // initialize list of media types
    this._mediaTypeService.getAllMediaTypes().subscribe(allTypes => {
      this.mediaTypes = allTypes;
    });
    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this._channelservice.getAllOnLevel(-1).subscribe(channels => {
      this.baseChannels = channels;
    })
  }
  async logChanges(title: string, change: string, mediaID: number) {
    let userName = this.currentUser.firstName.concat(" ").concat(this.currentUser.lastName)
    let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
    let role = roles[this.currentUser.roleCode - 1];
    let currentdate = new Date()
    const entry: AdminAuditLog =
    {
      id: 0,
      category: "Channel",
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
        const changed: ChangedChannel =
        {
          changeID: x.id,
          channelID: mediaID,
        }
        this._changedChannelService.postChangedChannel(changed).subscribe(x => {
          resolve()
        })
      });
    })
  }

  addchannel() {
    let channel: Channel = {
      channelID: this.inputid,
      title: this.inputField
    }

    console.log(this.returnedMedia)

    if (this.inputField == '') {
      this.errormessage = 'title cannot be empty!'
    }
    else {
      for (let i = 0; i < this.baseChannels.length; i++) {
        if (this.baseChannels[i].title == channel.title) {
          alert("Error: Channel name already exists")
          return;
        }
      }
      this._channelservice.createNewChannel(channel).subscribe(data => {
        this.ac = data
        if (data.channelID) {

          let change = "Added Channel"
          let mediaID = data.channelID
          let title = channel.title
          this.logChanges(title, change, mediaID)
          console.log(channel)
          for (const media of this.selectedMedia) {
            this._channelservice.addChannelMedia(data.channelID, media).subscribe(data => {

            })
          }
          
        }
        this.router1.navigate(['/category']);
      }, error => {
        console.log(error)
      })
    }

  }

  ClearForInput() {
    if (this.inputField == "Type Here") {
      this.inputField = "";
    }
  }

  /**
   * Performs a search then
   * sets the search results on this page
   * */
  searchMedia(): void {
    // Reset values on new search
    this.noResults = false
    this.noSearchInput = false
    /*this.selectedMedia = null;*/

    if (this.searchText == "" || this.searchText == null) {
      this.noSearchInput = true
      return;
    }

    // perform the search
    this._mediaService.searchForMediaByTitle(this.searchText, false).subscribe(res => {
      if (res[0]) {
        for (const i of res) {
          i.checked = false
        }
        this.setCheckMedia(res, this.selectedMedia);
        this.returnedMedia = res
        if (this.changedMedia) {
          for (let i = 0; i < this.returnedMedia.length; i++) {
            var changeIndex = this.changedMedia.findIndex(item => item.mediaID === this.returnedMedia[i].mediaID)
            if (changeIndex !== -1) {
              this.returnedMedia[i].checked = this.changedMedia[changeIndex].checked
            }
          }
        }
      }
      else {
        this.noResults = true
        this.returnedMedia = []
      }
    })
    //this._router.navigate([this.SitePath+"admin/media"], { queryParams: { search: this.encodeSearchTerm() }});
  }

  setCheckMedia(search: Media[], hash: Media[]) {
    for (var smedia of search) {
      for (var hmedia of hash) {
        if (smedia.mediaID === hmedia.mediaID) {
          smedia.checked = true;
        }
      }
    }
  }

  /**
   * Getter for the string name of a media type based on its ID
   * @param typeID
   */
  mediaTypeString(typeID: number): string {
    var associatedMediaType = this.mediaTypes?.find(obj => { return obj.id == typeID });
    return associatedMediaType.name;
  }

  convertUTCDateToLocalDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toDateString();
  }

  /*list checked medias*/
  listchecked(media: Media) {
    console.log(media)
    if (media.checked == false) {
      this.selectedMedia.push(media)
    } else {
      this.selectedMedia.splice(this.selectedMedia.findIndex(item => item.mediaID === media.mediaID), 1)
    }
    console.log(this.selectedMedia)
  }


}
