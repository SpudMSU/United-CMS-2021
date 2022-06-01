import { Component, OnInit, Inject } from '@angular/core';

import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CcPopUpComponent } from '../cc-pop-up/cc-pop-up.component';
import { EditchildtitlePopUpComponent } from '../editchildtitle-pop-up/editchildtitle-pop-up.component';
/*import { MatDialogRef } from '@angular/material/dialog';*/
/*import { MAT_DIALOG_DATA } from "@angular/material/dialog";*/
import { NestedChannel } from '../models/nested-channel';
import { Media } from '../models/media';
import { MediaType } from '../models/media-type';
import { MediaService } from '../services/media.service';
import { MediaTypeService } from '../services/media-type.service';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { waitOnEventOrTimeout } from '../../assets/pdfjs/web/viewer';
import { User } from '../models/user';
import { ChangedChannelService } from '../services/changed-channel.service';
import { ChangedChannel } from '../models/changed-channel';

@Component({
  selector: 'app-edit-channel',
  templateUrl: './Editchannel.component.html',
  styleUrls: ['./Editchannel.component.css'],
})
export class EditchannelComponent implements OnInit {

  currentUser: User
  echannel: Channel
  parentId: number
  parentlevel: number
  newlevel: number
  noResults = false
  returnedMedia: Media[] = []
  mediaTypes: MediaType[]
  /*checked medias*/
  selectedMedia: Media[] = []
  items: boolean
  errormessage: string
  searchText: string = '';
  noSearchInput = false
  channelMedias: Media[]

  // pagination
  perPageCount: number = 10
  p: number = 1;
  indexForPage: number = 0;


  childlist: Channel[]
  ec: Channel = {
    channelID: 0,
    title: ""
  }
  childc: Channel = {
    channelID: 0,
    title:''
  }
  editchildc: Channel = {
    channelID: 0,
    title: ''
  }

  deletenested: NestedChannel

  form: FormGroup;

  inputField: string = "";
  inputid: number;

  changedMedia: Media[] = []
  channelBeforeEdit: Channel = {
    channelID: 0,
    title: ''
  }

  constructor(
    private _channelservice: ChannelService,
    private router: ActivatedRoute,
    private router1: Router,
    private matDialog: MatDialog,
    private _mediaTypeService: MediaTypeService,
    private _changedChannelService : ChangedChannelService,
    private _mediaService: MediaService,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService
/*    public dialogRef: MatDialogRef<CcPopUpComponent>,*/
    /*@Inject(MAT_DIALOG_DATA) public data: any*/) { }

  ngOnInit(): void {

    // initialize list of media types
    this._mediaTypeService.getAllMediaTypes().subscribe(allTypes => {
      this.mediaTypes = allTypes;
    });

    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.router.params.subscribe(params => {
      var ID = params['channelID'];
      var Level = params['level']
      this.parentId = ID
      this.parentlevel = Level
      this.newlevel = parseInt(Level) + 1
      /*if (!ID)
        return;*/
      this.getnestedchannel(ID)
      this._channelservice.getChannel(ID)
        .subscribe(channel => this.ec = channel,
          response => {
            if (response.status == 500) {
              console.log("api error")
              this.ec = {
                channelID: 0,
                title: ""
              }
            }

          }
        );
      this._channelservice.getChannel(ID).subscribe(channel => {
        this.channelBeforeEdit = channel;
        console.log("channel")
        console.log(this.channelBeforeEdit)
      })
      this.getmediabychannel(ID)
    });

  }

  ClearForInput() {
    if (this.inputField == "Type Here") {
      this.inputField = "";
    }
  }

  async logChanges(title: string, change: string, mediaID: number, channel: Channel, other=null) {
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
      category: "Channel",
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
        const changed: ChangedChannel =
        {
          changeID: x.id,
          channelID: channel.channelID,
          title: channel.title,
        }
        if (change === "Deleted Subchannel") {
          changed.title = other.title
          changed.description = other.description
          changed.icon = other.icon
          changed.modifiedID = other.channelID
        }
        else if (change.includes("Media")) {
          changed.modifiedID = other.mediaID
        }
        console.log("the info")
        console.log(changed)
        console.log(channel)
        console.log(other)
        this._changedChannelService.postChangedChannel(changed).subscribe(x => {
          resolve()
        })
      });
    })
  }
  async editchannel() {
    let channel: Channel = {
      channelID: this.ec.channelID, //1.
      title: this.ec.title,
    }
    let change = "Updated Title"
    let mediaID = this.ec.channelID;
    let title = this.ec.title
    await this.logChanges(title, change, mediaID, this.channelBeforeEdit)
    this._channelservice.updateChannel(channel.channelID, channel).subscribe(data => {
      this.echannel = data
      if (channel.channelID) {
        for (const media of this.selectedMedia) {
          this._channelservice.addChannelMedia(channel.channelID, media).subscribe(data => {

          })
        }

      }
      this.router1.navigate(['/category/'+channel.channelID + '/0']);
    }, error => {
        console.log(error)
    })
    
  }

  async deletenestedchannel(channel) {
    let channelId = channel.channelID
    if (confirm("Are you sure you want to delete?")) {
      let nestedchannel: NestedChannel = {
        parentId: this.parentId,
        childId: this.childc.channelID
      }
      let change = "Deleted Subchannel";
      let title = this.ec.title.concat("/").concat(channel.title);
      let mediaID = this.ec.channelID;
      await this.logChanges(title, change, mediaID, this.channelBeforeEdit, channel)
      let cid: number = parseInt(channelId)
      this._channelservice.deleteRelationship(this.parentId, cid).subscribe(data => {
        this.deletenested = data
        this._channelservice.deleteChannel(cid).subscribe(res => {
          this.getnestedchannel(this.parentId)
        })
        
      })

    }
    
  }

  getnestedchannel(channelid) {
    this._channelservice.getChannelChildren(channelid).subscribe(child => {
      this.childlist = child
    }, error => {
      console.log(error)
    })
  }

  openaddDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { parentId: this.parentId, parentTitle: this.ec.title, ecID: this.ec.channelID };
    const dialogRef = this.matDialog.open(CcPopUpComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log("CLOSE DATA: ", result);
    });
  }

  openeditDialog(childId) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { parentId: this.parentId, childId: childId, parentTitle: this.ec.title, ecID: this.ec.channelID};
    const dialogRef = this.matDialog.open(EditchildtitlePopUpComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log("CLOSE DATA: ", result);
    });
  }

  backtoparent() {
    history.go(-1)
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
          i.checked = false;
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

  getmediabychannel(id) {
    this._channelservice.getChannelMedia(id).subscribe(data => {
      this.selectedMedia = data;
    })
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
  listchecked(event, media: Media) {
    if (this.changedMedia.find(m => media.mediaID == m.mediaID)) {
      var index = this.changedMedia.findIndex(function (item, i) {
        return item.mediaID === media.mediaID
      });
      this.changedMedia.splice(index, 1)
    }
    else {
      media.checked = event.target.checked
      this.changedMedia.push(media)
    }
  }

  async submitChanges() {
    for (let media of this.changedMedia) {
      if (media.checked)
        await this.add(this.ec.channelID, media)
      else
        await this.remove(this.ec.channelID, media)
    }
  }

  async add(channelID, media) {
    let baseurl = window.location.host;
    //let addurl = "#/media/".concat(media.mediaID)
    //let link = baseurl.concat(addurl)
    let change = "Added Media:".concat(media.title)//.link(link)
    let mediaID = this.ec.channelID;
    let title = this.ec.title
    await this.logChanges(title, change, mediaID, this.channelBeforeEdit, media)
    this._channelservice.addChannelMedia(channelID, media).subscribe()

  }

  async remove(channelID, media : Media) {
    let change = "Removed Media:".concat(media.title)
    let title = this.ec.title
    await this.logChanges(title, change, media.mediaID, this.channelBeforeEdit, media)

    this._channelservice.removeChannelMedia(channelID, media.mediaID).subscribe()
  }

}
