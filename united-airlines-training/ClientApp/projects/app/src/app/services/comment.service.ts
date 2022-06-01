/*
  Author: Chris Nosowsky
  Created: 10-21-2020
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Comment } from '../models/comment';
import { DatabaseService } from './database.service';
import { ThreadedComment } from '../models/threaded-comment';
import { CommentReasonForRejection } from '../models/CommentReasonForRejection';


@Injectable({
  providedIn: 'root'
})
export class CommentService extends DatabaseService {
  _apiRoute: string

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/Comment'
  }


  /*
    Comment CRUD Functions
  */

  // Get all comments
  getComments(): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get all approved comments
  getAllApprovedComments(): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/approved')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Get all queued comments
  getAllQueuedComments(): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/queued')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Get all approved comments for a particular user
  getAllUserComments(id: string): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/user/' + id)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get all queued comments for a particular user
  getQueuedUserComments(id: string): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/user/queued/' + id)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific comment
  getComment(id: string, mediaId: number, commentid: number): Observable<Comment> {
    return this._http.get<Comment>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId + '/comment/' + commentid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific approved media comments
  getMediaComments(mediaId: number): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/media/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get queued media comments
  getQueuedMediaComments(mediaId: number): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/media/queued/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getMediaRootComments(mediaId: number, approved: boolean): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + "/media/" + mediaId + "/root/approved/" + approved)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getMediaCommentRelationships(mediaId: number): Observable<ThreadedComment[]> {
    return this._http.get<ThreadedComment[]>(this._apiBaseUrl + this._apiRoute + "/media/" + mediaId + "/relationships")
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific approved user comment(s) on a particular media
  getUserMediaComment(mediaId: number, uid: string): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/media/' + mediaId + '/user/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific queued user comment(s) on a particular media
  getQueuedUserMediaComment(mediaId: number, uid: string): Observable<Comment[]> {
    return this._http.get<Comment[]>(this._apiBaseUrl + this._apiRoute + '/media/' + mediaId + '/user/queued/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }




  // Create comment
  createComment(comment: Comment): Observable<Comment> {
    return this._http.post<Comment>(this._apiBaseUrl + this._apiRoute, JSON.stringify(comment), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  createThreadedComment(parentId: number, reply: Comment): Observable<any> {
    return this._http.post<Comment>(this._apiBaseUrl + this._apiRoute + "/" + parentId + "/reply", JSON.stringify(reply), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Update a specific comment
  updateComment(id: string, mediaId: number, commentid: number, comment: Comment): Observable<Comment> {
    return this._http.put<Comment>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId + '/comment/' + commentid, JSON.stringify(comment), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Delete a specific comment
  deleteComment(id: string, mediaId: number, commentid: number): Observable<Comment> {
    return this._http.delete<Comment>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId + '/comment/' + commentid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  deleteThreadedComment(mediaId: number, parentId: number, replyId: number): Observable<any> {
    return this._http.delete<Comment>(this._apiBaseUrl + this._apiRoute + "/media/" + mediaId + "/comment/" + parentId + "/reply/" + replyId)
      .pipe(catchError(err => {
        return throwError(err);
      }));
  }

  getCommentReasonsForRejection(): Observable<CommentReasonForRejection[]> {
    return this._http.get<CommentReasonForRejection[]>(this._apiBaseUrl + this._apiRoute + "/ReasonForRejection")
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
