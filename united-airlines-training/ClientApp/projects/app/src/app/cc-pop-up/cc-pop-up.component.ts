import { Component, OnInit, Inject } from '@angular/core';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NestedChannel } from '../models/nested-channel';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { User } from '../models/user';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';

@Component({
  selector: 'app-cc-pop-up',
  templateUrl: './cc-pop-up.component.html',
  styleUrls: ['./cc-pop-up.component.css']
})
export class CcPopUpComponent implements OnInit {

  childchannel: Channel

  childandparent: NestedChannel

  childc: Channel = {
    channelID: 0,
    title: ''
  }

  baseChannels: Channel[]
  inputField: string = "";
  inputid: number;
  currentUser: User;

  constructor(private _channelservice: ChannelService,
    public dialogRef: MatDialogRef<CcPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: ActivatedRoute,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedChannelService: ChangedChannelService,
    private router1: Router,) { }

  ngOnInit(): void {
    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this._channelservice.getAllOnLevel(this.data.ecID).subscribe(channels => {
      this.baseChannels = channels;
    })
  }

  ClearForInput() {
    if (this.inputField == "Type Here") {
      this.inputField = "";
    }
  }

  achannel() {

  }
  async logChanges(title: string, change: string, mediaID: number, channel: Channel) {

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
          channelID: channel.channelID,
          title: channel.title,
        }
        console.log(changed)
        console.log(channel)
        this._changedChannelService.postChangedChannel(changed).subscribe(x => {
          resolve()
        })
      });
    })
  }

  async enterchildtitle() {
    let channel: Channel = {
      channelID: this.inputid,
      title: this.childc.title,
    }
    let nestedchannel: NestedChannel = {
      parentId: this.data.parentId,
      childId: this.childc.channelID
    }
    console.log("nested channel:" + nestedchannel)

    let change = "Added Subchannel";
    let title = this.data.parentTitle.concat("/").concat(channel.title);
    let mediaID = this.data.ecID;
    for (let i = 0; i < this.baseChannels.length; i++) {
      if (this.baseChannels[i].title == channel.title) {
        alert("Error: Channel name already exists")
        return;
      }
    }
    this._channelservice.createNewChannel(channel).subscribe(data => {

      this.logChanges(title, change, mediaID, data)
      this.childchannel = data
      let parentId: number = parseInt(this.data.parentId)
      console.log("parentId:" + typeof (parentId))
      this._channelservice.connectChannels(parentId, data.channelID).subscribe(candp => {
        this.childandparent = candp
        window.location.reload()
        this.close()
      })
      console.log("new:" + this.childchannel)
    }, error => {
      console.log(error)
    })

    console.log(channel)
  }

  close() {
      var channel_id = this.data.parentId
      this.dialogRef.close();
      this.router1.navigate(['/editchannel/' + channel_id]);
  }
}
