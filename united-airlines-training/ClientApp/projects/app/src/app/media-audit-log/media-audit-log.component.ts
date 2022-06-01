/*
  Author: Spencer Cassetta
*/
import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { MediaService } from '../services/media.service';
import { CommentService } from '../services/comment.service';
import { Media } from '../models/media';
import { Comment } from '../models/comment';
import { forkJoin } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserSaveModalComponent } from '../user-save-modal/user-save-modal.component';

@Component({
  selector: 'app-media-audit-log',
  templateUrl: './media-audit-log.component.html',
  styleUrls: ['./media-audit-log.component.css']
})
export class MediaAuditLogComponent implements OnInit {

  SitePath: string = environment.SitePath;

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
    { id: 1, name: "Admin" },
    { id: 1, name: "Moderator" },
    { id: 2, name: "Contributor" },
  ];

  // all returned comments
  returnedComments: Comment[] = [];

  // coorelates with the comments returned, but is indexed to display the media titles returned in the title column
  mediaTitleComments = [];

  /**
   * Constructor initializes all services used
   */
  constructor(
    private _mediaService: MediaService,
    private _commentService: CommentService,
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
    this.searched = true
    if (res != null) {
      var returnedCommentsOG = []
      for (let comment of res) {
        if (this.mediaOptions.find(m => m.id == comment.mediaID))
          returnedCommentsOG.push(comment)
      }
      if (this.mediaTitle != "All") {
        var mid = this.mediaOptions.find(m => m.title == this.mediaTitle)
        returnedCommentsOG = returnedCommentsOG.filter(m => m.mediaID == mid.id)
        if (returnedCommentsOG.length == 0)
          return
      }
      this.noResults = false
      this.returnedComments = returnedCommentsOG.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
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
    this._commentService.deleteComment(this.returnedComments[index].uid, this.returnedComments[index].mediaID, this.returnedComments[index].commentID).subscribe(res => {
      console.log("Comment Deleted.")
      this.returnedComments.splice(index, 1)
    })

  }

  /**
   * Approves comment when checkmark icon is pressed on a row
   */
  approveComment(index: number) {
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
