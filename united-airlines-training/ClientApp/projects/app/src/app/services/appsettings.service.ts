/*
  Author: Chris Nosowsky
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatabaseService } from './database.service';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService extends DatabaseService {
  _apiRoute: string
  _apiMediaFeedbackRoute

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/AppSettings'
  }

  /*
    Help CRUD
  */

  // Get help appsettings content
  getHelpContent(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/Help')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  /*
    About CRUD
  */

  // Get about appsettings content
  getAboutContent(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/About')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /*
    Media CRUD
  */

  // Get about appsettings content
  getVideoAutoPlay(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/AutoPlay')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get about appsettings content
  getDefaultThumbnailImage(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/DefaultThumbnail')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  // Get about appsettings content
  getCommentAutoApprove(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/AutoApproveComments')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  // Get about appsettings content
  getMediaCommentingSettings(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/CommentingSettings')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


}
