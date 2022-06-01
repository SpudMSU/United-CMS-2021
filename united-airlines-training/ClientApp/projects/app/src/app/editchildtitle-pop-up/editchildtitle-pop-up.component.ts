import { Component, OnInit, Inject } from '@angular/core';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { ChangedChannel } from '../models/changed-channel';
import { User } from '../models/user';
import { ChangedChannelService } from '../services/changed-channel.service';

@Component({
  selector: 'app-editchildtitle-pop-up',
  templateUrl: './editchildtitle-pop-up.component.html',
  styleUrls: ['./editchildtitle-pop-up.component.css']
})
export class EditchildtitlePopUpComponent implements OnInit {

  inputField: string = "";
  inputid: number;
  channelBeforeEdit: Channel;
  editchildchannel: Channel = {
    channelID: 0,
    title: ""
  }
  childchannel: Channel

  editchildchannellist: Channel[]
  currentUser: User
  constructor(private _channelservice: ChannelService,
    public dialogRef: MatDialogRef<EditchildtitlePopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedChannelService: ChangedChannelService,
    private router: ActivatedRoute,
    private router1: Router,) { }

  ngOnInit(): void {
    var ID = this.data.childId
    this.getnestedchannel(ID)
    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  ClearForInput() {
    if (this.inputField == "Type Here") {
      this.inputField = "";
    }
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

  async editchildtitle() {
    let channel: Channel = {
      channelID: this.editchildchannel.channelID,
      title: this.editchildchannel.title,
    }
    let change = "Updated Subchannel Title";
    let title = this.data.parentTitle.concat("/").concat(channel.title);
    let mediaID = this.data.ecID;
    await this.logChanges(title, change, mediaID, this.channelBeforeEdit)
    this._channelservice.updateChannel(channel.channelID, channel).subscribe(data => {
      this.childchannel = data
      this.close()
    }, error => {
      console.log(error)
    })
  }

  getnestedchannel(channelid) {
    console.log("nested")
    this._channelservice.getChannel(channelid).subscribe(child => {
      this.editchildchannel = child
      this.channelBeforeEdit = Object.assign({}, child);
      console.log(this.channelBeforeEdit)
    }, error => {
      console.log(error)
    })
  }

  close() {
    var channel_id = this.data.parentId
    /*this.router1.navigate(['/editchannel', channel_id]);*/
    /*this.router1.navigate(['/editchannel/' + channel_id]);*/
    window.location.reload()
    /*this.router1.navigate(['/editchannel', channel_id]);*/
    this.dialogRef.close();
  }

}
