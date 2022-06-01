import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { MediaService } from '../services/media.service';
import { CommentService } from '../services/comment.service';
import { Media } from '../models/media';
import { Comment } from '../models/comment';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserSaveModalComponent } from '../user-save-modal/user-save-modal.component';
import { UserService } from '../services/user.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { User } from '../models/user';

@Component({
  selector: 'app-manage-comments',
  templateUrl: './manage-comments.component.html',
  styleUrls: ['./manage-comments.component.css']
})
export class ManageCommentsComponent implements OnInit {
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
    createdAt: null,
    updatedAt: null,
  };

  // pagination limits to 10 items returned per page
  perPageCount: number = 10

  // starting page number
  p: number = 1;

  indexForPage: number = 0;

  // Whether or not the user clicked the search button
  searched: boolean = false;

  mediaOptions = [];

  // Default dropdown value when page loads
  status: string = "Queued";

  // Default dropdown for title dropdown when page loads
  mediaTitle: string = "All";

  // Whether or not any results came back after searching
  noResults: boolean = true;

  // Status options for the comments
  statusOptions = [
    { id: 0, name: "All" },
    { id: 1, name: "Approved" },
    { id: 2, name: "Queued" },
  ];

  // all returned comments
  returnedComments: Comment[] = [];

  // coorelates with the comments returned, but is indexed to display the media titles returned in the title column
  mediaTitleComments = [];

  userId: string = "";

  /**
   * Constructor initializes all services used
   */
  constructor(
    private _mediaService: MediaService,
    private _commentService: CommentService,
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _matDialog: MatDialog,
  ) { }

  /**
   * Component initialize function
   */
  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    this._mediaService.getAllItems().subscribe(res => {
      this.addMediaTitles(res);
    })

    this.getUser();
  }

  logChanges(title: string, change: string, mediaID: number) {
    console.log(mediaID)
    console.log([title, change, mediaID]);
    this._userService.getCurrentUser().subscribe(user => {
      let userName = user.firstName.concat(" ").concat(user.lastName)
      let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
      let role = roles[user.roleCode - 1];
      let currentdate = new Date()
      this._adminAuditService.getNumEntries().subscribe(data => {
        const entry: AdminAuditLog =
        {
          id: data["count"],
          category: "Comment",
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
        });
      })
    })
  }

 /**
* Get current user information
*/
  getUser() {
    this._userService.getCurrentUser().subscribe(res => {
      console.log(res);
      if (res != null) {
        this.user = res
        this.userId = res['uid'];
      }
    })
  }

  /**
   * Get's all media titles to display in the media title search dropdown option
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
   * Gets all comments according to the filtering and search input
   */
  searchResults() {
    this.returnedComments = []
    this.noResults = true
    this.searched = false


    if (this.status == "All") {
      this._commentService.getComments().subscribe(res => {
        this.getComments(res)
      })
    } else if (this.status == "Queued") {
      this._commentService.getAllQueuedComments().subscribe(res => {
        this.getComments(res)
      })
    } else if (this.status == "Approved") {
      this._commentService.getAllApprovedComments().subscribe(res => {
        this.getComments(res)
      })
    }
  }

  /**
   * Gets all comments returned after searching
   */
  getComments(res) {
    console.log(this.user.uid);
    this.searched = true
    if (res != null) {
      var returnedCommentsOG = []
      for (let comment of res) {
        if (this.mediaOptions.find(m => m.id == comment.mediaID))
          returnedCommentsOG.push(comment)
      }

      if (this.mediaTitle != "All") {
        var mid = this.mediaOptions.find(m => m.title == this.mediaTitle)
        if (mid) {
          returnedCommentsOG = returnedCommentsOG.filter(m => m.mediaID == mid.id)
          returnedCommentsOG = returnedCommentsOG.filter(m => m.uid == this.userId)
          if (returnedCommentsOG.length == 0)
            return
        }
      }
      this.noResults = false
      this.returnedComments = returnedCommentsOG.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

      console.log(this.returnedComments);
      this.returnedComments = this.returnedComments.filter(m => m.uid == this.userId);
      console.log(this.returnedComments);

      const obs = this.returnedComments.map(t => this._mediaService.getMedia(t.mediaID))
      forkJoin(obs).subscribe(data => {
        this.mediaTitleComments = data
      })
    }
  }

  /**
   * Updates index according to pagination page number
   */
  updateIndexPage(p: number) {
    this.indexForPage = this.perPageCount * (p - 1)
  }

  /**
   * Converts database UTC date to a local date
   */
  convertUTCDateToLocalDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toDateString();
  }

  /**
   * Deletes comment when delete icon is pressed on a row
   */
  deleteComment(index: number) {
    let change = "Comment Deleted"
    let mediaID = this.returnedComments[index].mediaID
    title: String
    this._mediaService.getMedia(mediaID).subscribe(media => {
      this.logChanges(media.title, change, mediaID)
    })


    this._commentService.deleteComment(this.returnedComments[index].uid, this.returnedComments[index].mediaID, this.returnedComments[index].commentID).subscribe(res => {
      console.log("Comment Deleted.")
      this.returnedComments.splice(index, 1)
    })

  }

  /**
   * Approves comment when checkmark icon is pressed on a row
   */
  approveComment(index: number) {
    let change = "Queued Comment Approved"
    let mediaID = this.returnedComments[index].mediaID
    title: String
    this._mediaService.getMedia(mediaID).subscribe(media => {
      this.logChanges(media.title, change, mediaID)
    })
    this.returnedComments[index].queued = false;
    this._commentService.updateComment(this.returnedComments[index].uid, this.returnedComments[index].mediaID, this.returnedComments[index].commentID, this.returnedComments[index]).subscribe(data => {
      console.log("Comment Approved.")
    })
  }

  /**
   * Before deleting or approving comments, make sure the user confirms that they are sure they want to approve/delete
   */
  confirmModal(action, index) {
    const dialogConfig = new MatDialogConfig();
    if (action == 'approve')
      dialogConfig.data = { title: "Are you sure you want to approve the comment?" };
    if (action == 'delete')
      dialogConfig.data = { title: "Are you sure you want to delete the comment?" };
    const dialogRef = this._matDialog.open(UserSaveModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(closeData => {
      if (closeData) {
        if (action == 'approve')
          this.approveComment(index)
        if (action == 'delete')
          this.deleteComment(index)
      }
    })
  }


}
