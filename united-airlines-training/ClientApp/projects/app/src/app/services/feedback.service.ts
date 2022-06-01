/*
  Author: Chris Nosowsky
  Created: 10-6-2020
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { GeneralFeedback } from '../models/general-feedback';
import { MediaFeedback } from '../models/media-feedback';
import { DatabaseService } from './database.service';
import { UserFeedbackData } from '../models/user-feedback-data';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService extends DatabaseService {
  _apiRoute: string
  _apiMediaFeedbackRoute

/**
* Feedback service class for making CRUD calls
* @param __http Http client service
*/
  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/GeneralFeedback'
    this._apiMediaFeedbackRoute = '/api/MediaFeedback'
  }

  /*
    General Feedback CRUD Functions
  */

/**
 * Get all general feedback in database table
 */
  getGeneralFeedbacks(): Observable<GeneralFeedback[]> {
    return this._http.get<GeneralFeedback[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


/**
* Get a specific general feedback
* @param generalFeedbackId general feedback primary key
*/
  getGeneralFeedback(generalFeedbackId: number): Observable<GeneralFeedback> {
    return this._http.get<GeneralFeedback>(this._apiBaseUrl + this._apiRoute + '/' + generalFeedbackId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


/**
* Create general feedback
* @param feedback feedback model
*/
  sendGeneralFeedback(feedback: UserFeedbackData): Observable<GeneralFeedback> {
    return this._http.post<GeneralFeedback>(this._apiBaseUrl + this._apiRoute, JSON.stringify(feedback), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* send contact email
* @param feedback feedback model
*/
  sendContactEmail(feedback: UserFeedbackData): Observable<any> {
    return this._http.post<any>(this._apiBaseUrl + this._apiRoute + '/contact', JSON.stringify(feedback), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Delete specific general feedback item from database
* @param generalFeedbackId feedback primary key
*/
  deleteGeneralFeedback(generalFeedbackId: number): Observable<GeneralFeedback> {
    return this._http.delete<GeneralFeedback>(this._apiBaseUrl + this._apiRoute + '/' + generalFeedbackId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /*
    Media Feedback CRUD Functions
  */


/**
* Get all media feedback
*/
  getMediaFeedbacks(): Observable<MediaFeedback[]> {
    return this._http.get<MediaFeedback[]>(this._apiBaseUrl + this._apiMediaFeedbackRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


/**
* Get a specific media feedback
* @param mediaId media primary key
*/
  getMediaFeedback(mediaId: number): Observable<MediaFeedback> {  // may run issues with two PK's (user + media ID)
    return this._http.get<MediaFeedback>(this._apiBaseUrl + this._apiMediaFeedbackRoute + '/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


/**
* Create media feedback
* @param feedback feedback data model
*/
  sendMediaFeedback(feedback: UserFeedbackData): Observable<MediaFeedback> {
    return this._http.post<MediaFeedback>(this._apiBaseUrl + this._apiMediaFeedbackRoute, JSON.stringify(feedback), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Delete a specific media feedback
* @param mediaId media primary key in database
*/
  deleteMediaFeedback(mediaId: number): Observable<MediaFeedback> {  // may run issues with two PK's (user + media ID)
    return this._http.delete<MediaFeedback>(this._apiBaseUrl + this._apiMediaFeedbackRoute + '/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
