import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Media } from '../../models/media';
import { User } from '../../models/user';
import { Comment } from '../../models/comment'
import { ThreadedComment } from '../../models/threaded-comment'
import { CommentService } from '../../services/comment.service';
import { UserService } from '../../services/user.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserSaveModalComponent } from '../../user-save-modal/user-save-modal.component';
import { Observable } from 'rxjs';
import { AppSettingsService } from '../../services/appsettings.service';
import { ChangedComment } from '../../models/changed-comment';
import { AdminAuditLog } from '../../models/admin-audit-log';
import { ChangedCommentService } from '../../services/changed-comment.service';
import { AdminAuditLogService } from '../../services/admin-audit-log.service';

@Component({
  selector: 'app-comments-view',
  templateUrl: './comments-view.component.html',
  styleUrls: ['./comments-view.component.css']
})
export class CommentsViewComponent implements OnInit {
  @Input() currentUser: User;
  @Input() currentUserId: string;
  @Input() selectedMedia: Media;
  @Input() autoApprove: boolean;

  // The media comments
  //mediaComments: Comment[]
  //mediaLoadedComments: Comment[] = []
  //queuedUsers = []
  //queuedCommentDates = []
  //queuedLoadedComments = []

  // Determine if a "load more" button should be shown for comments

  //loadMoreQueuedButton: boolean = false

  // Starting index for loading more. Increments by 5 everytime a user presses "load more"
  //loadMoreStartIndex: number = 0
  //loadMoreQueuedStartIndex: number = 0

  // Current time
  //currentTime = moment(new Date())

  // A list of all the user comment dates
  //commentDates = []

  // A list of all the users who commented
  //usersWhoPosted = []

  //userComment: boolean[] = []

  //Used for comment inputs
  inputField: string = "";

  sendCommentStatus = false;

  approvedComments: Comment[] = [];
  queuedComments: Comment[] = [];

  loadMoreButton: boolean = false

  queuedCommentsViewable: boolean = false;

  commentRelationships: ThreadedComment[] = [];
  rootComments: Comment[] = [];


  constructor(
    private _commentService: CommentService,
    private _userService: UserService,
    private matDialog: MatDialog,
    private _appSettingsService: AppSettingsService,
    private _changedCommentService: ChangedCommentService,
    private _adminAuditService: AdminAuditLogService
  ) { }

  ngOnInit(): void {
    //this.loadMoreStartIndex = 0
    //this.loadMoreQueuedStartIndex = 0
    //this.mediaLoadedComments = []
    //this.queuedLoadedComments = []
    //this.userComment = []
    //this.queuedComments = []
    //this.queuedCommentDates = []
    //this.queuedUsers = []
    //this.loadMoreButton = false
    //this.loadMoreQueuedButton = false

    this.sendCommentStatus = false;

    this.queuedCommentsViewable = this.currentUser.roleCode >= 2 ? true : false;

    // Retreive all comments for this media item
    this._commentService.getMediaCommentRelationships(this.selectedMedia.mediaID).subscribe(commentRelationships => {
      this.commentRelationships = commentRelationships;
      this._commentService.getMediaComments(this.selectedMedia.mediaID).subscribe(allComments => {
        this._commentService.getMediaRootComments(this.selectedMedia.mediaID, true).subscribe(rootComments => {
          this.rootComments = rootComments;
          this.approvedComments = this.organizeCommentHeirarchy(allComments, rootComments, commentRelationships);
          console.log(this.approvedComments);
        })
      })
      this._commentService.getQueuedMediaComments(this.selectedMedia.mediaID).subscribe(allQueued => {
        this.queuedComments = allQueued;
      })
    })

  }

  /**
   * Pretty messy; takes a list of all comments, root comments (comments without a parent), and the relationships between comments
   * to organize it into a heirarchical structure where root comments contain threaded comments (replies) inside a list on that object
   * called 'threaded comments'
   * @param allComments
   * @param rootComments
   * @param relationships
   */
  organizeCommentHeirarchy(allComments: Comment[], rootComments: Comment[], relationships: ThreadedComment[]): Comment[] {
    for (let comment of allComments) {
      let rels = relationships.filter(ele => ele.parentID == comment.commentID);
      if (rels.length > 0) {
        for (let childRel of rels) {
          let child = allComments.find(ele => ele.commentID == childRel.childID);
          if (child) {
            if (!comment.ThreadedComments) {
              comment.ThreadedComments = [];
            }
            child.parentId = comment.commentID;
            comment.ThreadedComments.push(child);
          }
        }
      }

    }

    // Then fill the place of all the channels in rootChannels with it's fully-associated version
    let i = 0;
    while (i < rootComments.length) {
      let fullComment = allComments.find(ele => ele.commentID == rootComments[i].commentID);
      rootComments[i] = fullComment;
      i += 1;
    }
    return rootComments;
  }

  logChanges(title: string, change: string, mediaID: number, comment: Comment) {
    console.log(mediaID)
    console.log([title, change, mediaID]);
    let userName = this.currentUser.firstName.concat(" ").concat(this.currentUser.lastName)
    let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
    let role = roles[this.currentUser.roleCode - 1];
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
        const changedComment: ChangedComment =
        {
          changeID: x.id,
          uID: comment.uid,
          mediaID: comment.mediaID,
          commentID: comment.commentID,
          description: comment.description,
          queued: comment.queued,
          createdAt: comment.createdAt,
          parentId: comment.parentId,
        }
        this._changedCommentService.postChangedComment(changedComment).subscribe(x => {
          console.log(x)
        })
      });
    })
  }

  deleteComment(comment: Comment) {
    let change = "Comment Deleted"
    let mediaID = this.selectedMedia.mediaID
    let title = this.selectedMedia.title
    var sComment = Object.assign({}, comment)
    this.logChanges(title, change, mediaID, sComment)
    //this.logChanges(title, change, mediaID, null, "Comment",)
    this._commentService.deleteComment(comment.uid, this.selectedMedia.mediaID, comment.commentID).subscribe(res => {
      if (comment.queued) {
        let ind = this.queuedComments.findIndex(ele => ele.commentID == comment.commentID);
        this.queuedComments.splice(ind, 1);
      } else {
        let ind = this.approvedComments.findIndex(ele => ele.commentID == comment.commentID);
        this.approvedComments.splice(ind, 1);
      }
    })
  }

  deleteCommentReply(comment: Comment, reply: Comment) {

    let change = "Comment Deleted"
    let mediaID = this.selectedMedia.mediaID
    let title = this.selectedMedia.title
    var sComment = Object.assign({}, reply)
    this.logChanges(title, change, mediaID, sComment)
    this._commentService.deleteThreadedComment(this.selectedMedia.mediaID, comment.commentID, reply.commentID).subscribe(response => {
      let parentInd = this.approvedComments.findIndex(ele => ele.commentID == comment.commentID);
      let childInd = this.approvedComments[parentInd].ThreadedComments.findIndex(ele => ele.commentID == reply.commentID);
      this.approvedComments[parentInd].ThreadedComments.splice(childInd, 1);
      //if (this.approvedComments[parentInd].ThreadedComments.length == 0) {
      //  this.approvedComments[parentInd].ThreadedComments = null;
      //}
    });
  }

  approveQueuedComment(comment: Comment) {
    let change = "Comment Approved"
    let mediaID = this.selectedMedia.mediaID
    let title = this.selectedMedia.title
    var sComment = Object.assign({}, comment)
    this.logChanges(title, change, mediaID, sComment)
    //this.logChanges(title, change, mediaID, null, "Comment")
    //this.queuedComments[index].queued = false
    comment.queued = false;
    this._commentService.updateComment(comment.uid, comment.mediaID, comment.commentID, comment).subscribe(data => {
    
      let queuedInd = this.queuedComments.findIndex(ele => ele.commentID == comment.commentID);
      this.queuedComments.splice(queuedInd, 1);

      // TODO: figure out if this comment is threaded or not and perform the necessary actions
      let thread = this.commentRelationships.find(ele => ele.childID == comment.commentID);
      console.log(thread);
      if (thread != undefined) {
        let parentInd = this.approvedComments.findIndex(ele => ele.commentID == thread.parentID);
        console.log(parentInd);
        if (!this.approvedComments[parentInd].ThreadedComments) {
          this.approvedComments[parentInd].ThreadedComments = [];
        }
        this.approvedComments[parentInd].ThreadedComments.push(comment);
        console.log(this.approvedComments[parentInd]);
      } else {
        this.approvedComments.push(comment);
      }
    })
  }

  //Confirm deleting or approving comment modal
  confirmModal(action): Observable<any> {
    const dialogConfig = new MatDialogConfig();
    if (action == 'approve')
      dialogConfig.data = { title: "Are you sure you want to approve the queued comment?" };
    if (action == 'delete-queued')
      dialogConfig.data = { title: "Are you sure you want to delete the queued comment?" };
    if (action == 'delete')
      dialogConfig.data = { title: "Are you sure you want to delete the comment?" };
    const dialogRef = this.matDialog.open(UserSaveModalComponent, dialogConfig);
    return dialogRef.afterClosed();
  }

  createUserComment(desc: string) {
    if (desc.trim() != '') {
      let comment: Comment = { uid: this.currentUserId, mediaID: this.selectedMedia.mediaID, description: desc, queued: true, createdAt: new Date() }
      this._commentService.createComment(comment).subscribe(res => {
        let autoApproved = !res['queued'];
        let com = res['completeComment']['value'];
        this.inputField = ''

        if (autoApproved) {
          this.approvedComments.push(com);
        } else {
          this.sendCommentStatus = true;
          this.queuedComments.push(com);
        }

      })
    }
  }

  createNewThreadedComment(comment: Comment) {
    this._commentService.createThreadedComment(comment.parentId, comment).subscribe(response => {
      // TODO: implement a response from the server to populate this ID field
      let autoApprove = !response['queued'];
      let reply: Comment = response['reply'];
      reply.parentId = comment.parentId;
      comment.ThreadedComments = null;


      if (autoApprove) {
        let parent = this.approvedComments.find(ele => ele.commentID == reply.parentId);
        if (!parent.ThreadedComments) {
          parent.ThreadedComments = [];
        }
        parent.ThreadedComments.push(reply);
      } else {
        this.queuedComments.push(comment);
        this.sendCommentStatus = true;
      }

    })
  }

  updateCommentStatus() {
    this.sendCommentStatus = false;
  }

  onCommentDeleteRequest(comment: Comment) {
    this.confirmModal("delete").subscribe(confirm => {
      if (confirm) {
        this.deleteComment(comment);
      }
    })
  }

  onCommentReplyDeleteRequest(event: { parent: Comment, child: Comment }) {
    this.confirmModal("delete").subscribe(confirm => {
      if (confirm) {
        this.deleteCommentReply(event.parent, event.child);
      }
    })
  }

  onCommentApproveRequest(comment: Comment) {
    this.confirmModal("approve").subscribe(confirm => {
      if (confirm) {
        this.approveQueuedComment(comment);
      }
    })
  }

}
