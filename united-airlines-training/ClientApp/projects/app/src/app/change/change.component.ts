import { Component, Inject, OnInit, SystemJsNgModuleLoaderConfig } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AdminAuditLog } from '../models/admin-audit-log';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedMedia } from '../models/changed-media';
import { ChangedUser } from '../models/changed-user';
import { Channel } from '../models/channel';
import { Media } from '../models/media';
import { User } from '../models/user';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { ChangedChannelService } from '../services/changed-channel.service';
import { ChangedMediaService } from '../services/changed-media.service';
import { ChangedUserService } from '../services/changed-user.service';
import { ChannelService } from '../services/channel.service';
import { MediaService } from '../services/media.service';
import { UserService } from '../services/user.service';
import { CommentService } from '../services/comment.service';
import { ChangedCommentService } from '../services/changed-comment.service';
import { ChangedComment } from '../models/changed-comment';
import { Comment } from '../models/comment';

@Component({
  selector: 'app-change',
  templateUrl: './change.component.html',
  styleUrls: ['./change.component.css']
})
export class ChangeComponent implements OnInit {
  isComment: boolean = false;
  constructor(private route: ActivatedRoute,
    private auditLogService: AdminAuditLogService,
    private changedMediaService: ChangedMediaService,
    private changedChannelService: ChangedChannelService,
    private changedCommentService: ChangedCommentService,
    private commentService: CommentService,
    private channelService: ChannelService,
    private mediaService: MediaService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private changedUserService: ChangedUserService) { }

  log: AdminAuditLog
  changeId: number = this.data.changeId
  cType: string
  loaded = false;
  changedChannel: ChangedChannel
  changedMedia: ChangedMedia
  changedUser: ChangedUser
  changedComment: ChangedComment
  channel: Channel
  media: Media
  user: User
  _comment: Comment
  isChannel = false;
  isMedia = false;
  isUser = false;
  mediaList: Media[];
  ngOnInit(): void {
    console.log(1);
    this.parseChanges()
  }
  async getLog(id: number) {
    console.log(5);
    await new Promise((resolve, reject) => {
      this.auditLogService.getEntry(id).subscribe(entry => {
        this.log = entry
        console.log(6);
        resolve();
      })
    })

  }
  async getChangedChannel(index: number) {
    await new Promise((resolve, reject) => {
      this.changedChannelService.getChangedChannel(index).subscribe(entry => {
        this.changedChannel = entry;
        resolve();
      })
    })
    if (!this.log.change.includes("Delete")) {
      await new Promise((resolve, reject) => {
        this.channelService.getChannel(this.changedChannel.channelID).subscribe(entry => {
          this.channel = entry;
          resolve();
        })
      })
      await new Promise((resolve, reject) => {
        this.channelService.getChannelMedia(this.changedChannel.channelID).subscribe(entry => {
          this.mediaList = entry;
          resolve();
        })
      })
    }
    else {
      this.channel = {
        channelID: this.log.mediaID,
        title: "deleted",
        
      }
    }
  }


  async getChangedComment(index: number) {
    await new Promise((resolve, reject) => {
      this.changedCommentService.getChangedComment(index).subscribe(entry => {
        this.changedComment = entry
        resolve()
      })
    })
    if (!this.log.change.includes("Delete")) {
      await new Promise((resolve, reject) => {
        this.commentService.getComment(this.changedComment.uID, this.changedComment.mediaID, this.changedComment.commentID).subscribe(entry => {
          this._comment = entry;
          resolve();
        })
      })
    }
    else {
      this._comment = {
        uid: "deleted",
        mediaID: null,
        description: "deleted"
      }
    }
  }

  
  async getChangedMedia(index: number) {
    await new Promise((resolve, reject) => {
      this.changedMediaService.getChangedMedia(index).subscribe(entry => {
        this.changedMedia = entry
        resolve()
      })
    })
    if (!this.log.change.includes("Delete")) {
      await new Promise((resolve, reject) => {
        this.mediaService.getMedia(this.changedMedia.mediaID).subscribe(entry => {
          this.media = entry;
          resolve();
        })
      })
    }
    else {
      this.media = {
        mediaID: this.log.mediaID,
        title: "deleted",
        description: "deleted",
        mediaStatus: "deleted",
        path: "deleted"
      }
    }
  }
  async getChangedUser(index: number) {
    await new Promise((resolve, reject) => {
      this.changedUserService.getChangedUser(index).subscribe(entry => {
        this.changedUser = entry
        resolve()
      })
    })
  }
  async GetUser() {
    await new Promise((resolve, reject) => {
      this.userService.getUser(this.changedUser["uid"]).subscribe(entry => {
        this.user = entry;
        console.log("entry:")
        console.log(entry);
        resolve();
      })
    })
  }
  async parseChanges() {
    console.log(4);
    await this.getLog(this.changeId);
    console.log(7);
    this.cType = this.log.category;
    this.loaded = true;

    if (this.cType == "Channel") {
      await this.getChangedChannel(this.log.id)
      this.isChannel = true
      console.log(this.changedChannel)
      console.log(this.channel)
    }
    else if (this.cType == "Media") {
      await this.getChangedMedia(this.log.id)
      this.isMedia = true
      console.log(this.changedMedia)
      console.log(this.media)
    }
    else if (this.cType == "User") {
      await this.getChangedUser(this.log.id)
      await this.GetUser();
      this.isUser = true
      console.log(this.changedUser)
      console.log(this.user)
    }
    else {
      await this.getChangedComment(this.log.id);
      this.isComment = true
      console.log(this.changedComment)
      console.log(this._comment)
    }
  }

}
