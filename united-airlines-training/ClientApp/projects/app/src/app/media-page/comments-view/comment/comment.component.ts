import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
import { Comment } from '../../../models/comment';
import { Media } from '../../../models/media';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
  @Input() comment: Comment;
  @Input() currentUser: User;
  @Input() currentUserId: string;
  @Input() isThreaded: boolean;
  @Input() selectedMedia: Media

  @Output() onReplySubmit: EventEmitter<Comment> = new EventEmitter<Comment>();
  @Output() onDelete: EventEmitter<Comment> = new EventEmitter<Comment>();
  @Output() onDeleteReply: EventEmitter<{ parent: Comment, child: Comment }> = new EventEmitter<{ parent: Comment, child: Comment }>();
  @Output() onApprove: EventEmitter<Comment> = new EventEmitter<Comment>();

  poster: User;
  postDateString: string;
  currentUserComment: boolean = false;
  repliesVisible: boolean = false;
  replyText: string = "";
  replyInputShown: boolean = false;

  // Dictates the number of columns this comment is offset by on the left side (threaded comments offset by 1 on the side)
  offset: number;


  constructor(
    private _userService: UserService
  ) { }

  ngOnInit(): void {
    this._userService.getUser(this.comment.uid).subscribe(user => {
      this.poster = user;
      this.currentUserComment = this.currentUser.uid == this.poster.uid;
    })
    this.postDateString = this.getCommentPostDate(this.comment.createdAt, this.comment.queued)
    this.offset = this.isThreaded ? 1 : 0;
  }

  getCommentPostDate(createdAt, queued: boolean) {
    var res = moment(this.convertUTCDateToLocalDate(new Date(createdAt))).fromNow()

    if (res.startsWith("an")) // Moment uses "an minute ago", "a month ago". Convert that to say "1 month ago", etc.
      res = '1 ' + res.split('an ')[1]
    else if (res.startsWith("a ") && res[2] != 'f')
      res = '1 ' + res.split('a ')[1]
    return res;
  }

  /*
 * Functions used to convert date formats from database
 */
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate;
  }

  toggleRepliesShown() {
    this.repliesVisible = !this.repliesVisible;
  }

  toggleReplyFieldShown() {
    this.replyInputShown = !this.replyInputShown;
  }

  onReplySubmitClicked() {
    let text = this.replyText.trim();
    if (text != "") {
      // TODO: change 'queued' to reference autoApprove var (maybe?  Could do this on the backend implicitly as well)
      let comment: Comment = {
        uid: this.currentUserId,
        mediaID: this.selectedMedia.mediaID,
        description: text,
        queued: true,
        createdAt: new Date(),
        parentId: this.comment.commentID
      }
      this.onReplySubmit.emit(comment);
    }
    this.replyText = "";
    this.replyInputShown = false;
  }

  cancelReply() {
    this.replyText = "";
    this.toggleReplyFieldShown();
  }

  onApproveClicked() {
    this.onApprove.emit(this.comment);
  }

  onDeleteClicked() {
    this.onDelete.emit(this.comment);
  }

  onReplyDeleteClicked(reply) {
    this.onDeleteReply.emit({ parent: this.comment, child: reply });
  }

}
