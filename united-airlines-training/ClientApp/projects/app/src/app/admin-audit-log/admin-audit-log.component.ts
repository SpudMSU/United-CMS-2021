/*
  Author: Spencer Cassetta
*/
import { Component, OnInit, HostListener } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AdminAuditLog } from '../models/admin-audit-log';
import { MediaService } from '../services/media.service';
import { Media } from '../models/media';
import { ChangedMedia } from '../models/changed-media';
import { ChangedMediaService } from '../services/changed-media.service';
import { ChangedUserService } from '../services/changed-user.service';
import { UserService } from '../services/user.service';
import { ChangedChannel } from '../models/changed-channel';
import { ChangedChannelService } from '../services/changed-channel.service';
import { ChannelService } from '../services/channel.service';
import { Channel } from '../models/channel';
import { title } from 'process';
import { ChangeComponent } from '../change/change.component';
import { ChangedCommentService } from '../services/changed-comment.service';
import { Comment } from '../models/comment';
import { CommentService } from '../services/comment.service';
@Component({
  selector: 'app-admin-audit-log',
  templateUrl: './admin-audit-log.component.html',
  styleUrls: ['./admin-audit-log.component.css']
})

export class AdminAuditLogComponent implements OnInit {


  baseUrl: string = window.location.origin;
  SitePath: string = environment.SitePath;

  // pagination limits to 10 items returned per page
  perPageCount: number = 10

  // starting page number for pagination component
  p: number = 1;

  indexForPage: number = 0;
  table: HTMLTableElement

  // Default dropdown selected for what to search by
  selected: string = "Type"
  userSearchInput: string = ""
  itemSearchInput: string = ""
  dateSearchInput = ""
  currentRole: string[] = []
  currentUser: string[] = []
  currentItem: string[] = []
  currentChange: string[] = []
  currentDate: Date[] = []
  currentType: string[] = []

  returnedLogs: AdminAuditLog[]
  // Default input in dropdown when employment type is selected in search by
  typeInput: string = ""

  // Default input in dropdown when role level is selected in search by
  roleInput: string = "Moderator"
  dayInput: string = ""
  monthInput: string = ""

  Logs: AdminAuditLog[] = []
  noResults = false
  noSearchInput = false

  // boolean list of the size of the # of returned rows in search result
  // If true at an index, it means that row has been changed and needs to be saved
  saveChangesButton: boolean[] = []

  // Every option to search by
  selectOptions = [
    { id: 1, name: "Type", column: "Category" },
    { id: 2, name: "Modifier", column: "Username" },
    { id: 3, name: "Role", column: "UserRole" },
    { id: 4, name: "Date", column: "ChangeDate" }
  ];

  roleOptions = [
    { id: 1, name: "Moderator", roleCode: 2 },
    { id: 2, name: "Administrator", roleCode: 4 },
  ];

  dayOptions = [
    { id: 1, name: "1" },
    { id: 2, name: "2" },
    { id: 3, name: "3" },
    { id: 4, name: "4" },
    { id: 5, name: "5" },
    { id: 6, name: "6" },
    { id: 7, name: "7" },
    { id: 8, name: "8" },
    { id: 9, name: "9" },
    { id: 10, name: "10" },
    { id: 11, name: "11" },
    { id: 12, name: "12" },
    { id: 13, name: "13" },
    { id: 14, name: "14" },
    { id: 15, name: "15" },
    { id: 16, name: "16" },
    { id: 17, name: "17" },
    { id: 18, name: "18" },
    { id: 19, name: "19" },
    { id: 20, name: "20" },
    { id: 21, name: "21" },
    { id: 22, name: "22" },
    { id: 23, name: "23" },
    { id: 24, name: "24" },
    { id: 25, name: "25" },
    { id: 26, name: "26" },
    { id: 27, name: "27" },
    { id: 28, name: "28" },
    { id: 29, name: "29" },
    { id: 30, name: "30" },
    { id: 31, name: "31" },
  ];

  monthOptions = [
    { id: 1, name: "January" },
    { id: 2, name: "February" },
    { id: 3, name: "March" },
    { id: 4, name: "April" },
    { id: 5, name: "May" },
    { id: 6, name: "June" },
    { id: 7, name: "July" },
    { id: 8, name: "August" },
    { id: 9, name: "September" },
    { id: 10, name: "October" },
    { id: 11, name: "November" },
    { id: 12, name: "December" },
  ];
  // This will be set after getting all distinct employment statuses from database
  typeOptions = [
    { id: 0, name: "Channel" },
    { id: 1, name: "Media" },
    { id: 2, name: "Comment" },
    { id: 3, name: "User" },
  ]
  months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December']


  /**
   * Constructor initializes all services used in component
   */
  constructor(
    private _adminAuditService: AdminAuditLogService,
    private _mediaService: MediaService,
    private _commentService: CommentService,
    private _changedMediaService: ChangedMediaService,
    private _changedUserService: ChangedUserService,
    private _changedChannelService: ChangedChannelService,
    private _changedCommentServic: ChangedCommentService,
    private _channelService: ChannelService,
    private _userService: UserService,
    private _matDialog: MatDialog,
  ) { }

  /**
   * Component initialize function
   */
  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    // fills array on number of items returned on page
    this.saveChangesButton = new Array(this.perPageCount);
    // fills all with false since the page has unsaved changes
    this.saveChangesButton.fill(false)

    // This is solely assuming the statuses are in the table currently.
    this._adminAuditService.getAdminAuditLog().subscribe(data => {
      for (let info of data)
        this.Logs.push(info);
    })
    this.table = document.querySelector("#logtable")
  }
  GetLogs() {
    this.clearOtherInputs();
    this.noResults = false;
    this.noSearchInput = false;
    this.Logs = []
    this._adminAuditService.getAdminAuditLog().subscribe(data => {
      for (let info of data)
        this.Logs.push(info);
    })
  }

  async doChanged(log: AdminAuditLog): Promise<boolean> {
    console.log(log)
    let type = log.category;
    let changeID = log.id
    let change = log.change
    let mediaID = log.mediaID
    return await new Promise((resolve, reject) => {
      if (type === "Media") {
        if (change == "Added Media") {
          this._mediaService.deleteMedia(mediaID).subscribe(x => {
            resolve(true)
          });
        }
        this._changedMediaService.getChangedMedia(changeID).subscribe(prev => {
          if (prev == null) {
            resolve(false)
          }
          this._mediaService.getMedia(mediaID).subscribe(media => {

            if (media == null) {
              resolve(false)
            }
            if (change === "Updated Title") {
              if (prev.title == null) {
                resolve(false)
              }
            }
            else if (change === "Updated Description") {
              if (prev.description == null) {
                resolve(false)
              }
              media.description = prev.description
              media.title = prev.title
              media.path = prev.path

            }
            else if (change === "Updated Media Path") {
              if (prev.path == null) {
                resolve(false)
              }

            }
            else if (change === "Retired Media") {
              if (prev.mediaStatus == null) {
                resolve(false)
              }
              media.mediaStatus = prev.mediaStatus
            } else {
              media.title = prev.title
              media.createdAt = prev.createdAt
              media.description = prev.description
              media.flaggedAllUsers = prev.flaggedAllUsers
              media.flaggedCostCenters = prev.flaggedCostCenters
              media.flaggedDepartments = prev.flaggedDepartments
              media.flaggedJobCodes = prev.flaggedJobCodes
              media.flaggedJobGroups = prev.flaggedJobGroups
              media.flaggedLocations = prev.flaggedLocations
              media.mediaStatus = prev.mediaStatus
              media.mediaTypeID = prev.mediaTypeID
              media.path = prev.path
              media.thumbnailPath = prev.thumbnailPath
            }
            this._mediaService.updateMedia(mediaID, media).subscribe(x => {
              resolve(true)
            });
          })
        })
      }
      else if (type == "User") {
        this._changedUserService.getChangedUser(changeID).subscribe(prev => {
          if (prev == null) {
            resolve(false)
          }
          this._userService.getUser(prev["uid"]).subscribe(user => {
            if (user == null) {
              resolve(false)
            }
            else if (change == "Updated User Rolecode") {
              if (prev.roleCode == null) {
                resolve(false)
              }
              user.roleCode = prev.roleCode;
            }
            else if (change == "Updated User Employment Status") {
              if (prev.employmentStatus == null) {
                resolve(false)
              }
              user.employmentStatus = prev.employmentStatus;
            }
            else if (change.includes("User Email")) {
              if (prev.email == null) {
                resolve(false)
              }
              user.email = prev.email;
            }
            this._userService.updateUser(user["uid"], user).subscribe(x => {
              resolve(true)
            })
          })
        })
      }
      else if (type == "Channel") {
        console.log("changeID: " + changeID)
        this._changedChannelService.getChangedChannel(changeID).subscribe(prev => {
          console.log("previous")
          console.log(prev)
          if (prev == null) {
            resolve(false)
          }
          if (change.includes("Added Media")) {
            this._channelService.removeChannelMedia(prev.channelID, prev.modifiedID).subscribe(x => {
              resolve(true)
            })
          }
          else if (change.includes("Removed Media")) {
            this._mediaService.getMedia(prev.modifiedID).subscribe(media => {
              this._channelService.addChannelMedia(prev.channelID, media).subscribe(x => {
                resolve(true)
              })
            })
          }
          else if (change === "Deleted Subchannel") {
            const channel: Channel = {
              channelID: prev.modifiedID,
              title: prev.title,
              description: prev.description,
              icon: prev.icon
            }
            this._channelService.RevertChannel(channel).subscribe(t => {
              console.log(t);
              this._channelService.connectChannels(prev.channelID, t.channelID).subscribe(candp => {
                resolve(true)
              })
            })
          }
          else if (change === "Deleted Channel") {
            const channel: Channel = {
              channelID: prev.channelID,
              title: prev.title,
              description: prev.description,
              icon: prev.icon
            }
            console.log(channel)
            this._channelService.RevertChannel(channel).subscribe(t => {
              resolve(true)
            })
          }
          else if (change === "Added Channel" || change === "Added Subchannel") {
            this._channelService.deleteChannel(prev.channelID).subscribe(x => {
              resolve(true)
            })
          }
          else {
            this._channelService.getChannel(prev.channelID).subscribe(channel => {

              if (channel == null) {
                resolve(false)
              }
              channel.title = prev.title
              console.log("channel to update " + channel)
              console.log(channel)
              this._channelService.updateChannel(channel.channelID, channel).subscribe(x => {
                resolve(true)
              })

            })
          }
        })
      }
      else if (type === "Comment")
      {
        if (change === "Comment Deleted") {
          this._changedCommentServic.getChangedComment(changeID).subscribe(x => {
            console.log("thecomment")
            console.log(x)
            const thecomment: Comment = {
              uid: x['uid'],
              mediaID: x.mediaID,
              description: x.description,
              queued: x.queued,
              createdAt: x.createdAt,
              parentId: x.parentId,
            }
            console.log("the comment")
            console.log(thecomment)
            this._commentService.createComment(thecomment).subscribe(x => {
              resolve(true);
            })
          })
        }
      }
      else {
        resolve(false)
      }
    })
  }
  goToLink(url: string) {
    url = "http://localhost:5000/#/change/".concat(url);
    console.log(url)
    window.open(url, "_blank", "width=300,height=500");
  }
  openchangeDialog(ChangeId) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { changeId: ChangeId };
    const dialogRef = this._matDialog.open(ChangeComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      console.log("CLOSE DATA: ", result);
    });
  }

  async Revert(index: number) {

    let row = this.table.rows[index]
    let log = this.Logs[index + (this.perPageCount * (this.p - 1))]
    if (!log.reverted) {
      if (confirm("Are you sure you would like to revert this change? Reverting Changed cannot be undon")) {

        let res = await this.doChanged(log)
        console.log(res)
        if (res) {
          row.style.backgroundColor = "LightGray"
          this._adminAuditService.Revert(log);
          log.reverted = true;
        }
        else {
          alert("Error reverting change")
        }
      }
    }
    this.Logs[index + (this.perPageCount * (this.p - 1))] = log;
  }

  RevertInit(index: number) {
    console.log([index, this.p, this.perPageCount])
    let row = this.table.rows[index]
    row.style.backgroundColor = "LightGray"
  }

  clearOtherInputs() {
    this.dayInput = ""
    this.monthInput = ""
    this.userSearchInput = ""
    this.itemSearchInput = ""
    this.roleInput = "Moderator"
    this.typeInput = ""
    this.dateSearchInput = ""
  }

  /**
   * Before leaving page, determine if there are unsaved changes.
   * This connects with the unsaved-changes.guard file
   */
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveChangesButton.indexOf(true) !== -1)
      return false
    return true
  }

  /**
    * Before saving changes, it makes sure the user is sure that they want to save
    */

  /**
   * Turns on save changes button for that row if changes
   * have been made to any of the input fields
   */
  updateSelected(index: number) {
    this.saveChangesButton[index] = true
  }

  /**
   * Updates index for page to accomodate for each pagination page change
   */
  updateIndexPage(p: number) {
    this.indexForPage = this.perPageCount * (p - 1)
  }

  searchLog() {
    var searchInput = ""
    if (this.userSearchInput) {
      searchInput = this.userSearchInput
    }
    else if (this.selected == 'Type') {
      if (this.typeInput) {
        searchInput = this.typeInput;
      }
      else if (this.itemSearchInput) {
        searchInput = this.itemSearchInput
      }
      if (this.itemSearchInput && this.typeInput) {
        searchInput = searchInput.concat("/").concat(this.itemSearchInput)
      }
    }
    else if (this.selected == 'Date') {
      if (this.dayInput) { searchInput = this.dayInput }
      if (this.monthInput) { searchInput = searchInput.concat("/").concat(this.monthInput) }
      if (this.dateSearchInput) { searchInput = searchInput.concat("/").concat(this.dateSearchInput) };
    }
    // Check if role level or employment status is selected
    // They have different variables
    else if (this.selected == 'Role') {

      searchInput = this.roleInput
    }
    else {
      searchInput = ""
    }

    if (searchInput == "") {
      this.noSearchInput = true
    } else {

      // Reset values on new search
      this.noResults = false
      this.noSearchInput = false
      this.saveChangesButton.splice(0, this.saveChangesButton.length)
      this.currentRole.splice(0, this.currentRole.length)
      this.currentItem.splice(0, this.currentItem.length)
      this.currentUser.splice(0, this.currentUser.length)
      this.currentDate.splice(0, this.currentDate.length)
      this.currentType.splice(0, this.currentType.length)
      this.currentChange.splice(0, this.currentChange.length)

      var result = this.selectOptions.find(obj => {
        return obj.name == this.selected
      })
      this._adminAuditService.searchForLogs([searchInput], [result.column]).subscribe(res => {
        if (res[0]) {
          this.returnedLogs = res
          this.Logs = this.returnedLogs;
        }
        else {
          this.noResults = true
          this.returnedLogs = []
        }
      })
    }
  }

}
