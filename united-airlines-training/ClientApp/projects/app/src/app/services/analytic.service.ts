/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Media } from '../models/media';
import { DatabaseService } from './database.service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AnalyticService extends DatabaseService {
  _apiRoute: string

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/Analytic'
  }

/**
* Get latest media uploaded
*/
  getLatestMedia(): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Latest')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
/**
* Get user recommended media
*/
  getRecommendedMedia(uid: string): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Recommended/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
* Get user bookmarked recommended media
*/
  getBookmarkedMedia(uid: string): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Bookmarked/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Get flagged media items for user
*/
  getHotMedia(): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Hot')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Get trending media
*/
  getTrendingMedia(): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Trending')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Get related media
*/
  getRelatedMedia(currentMediaID: number): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/Related/' + currentMediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


/**
* Get click through rate for a particular media item
*/
  getMediaUtilization(mediaID: number): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/Utilization/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Get average watch duration for a particular media item (has to be a video item)
*/
  getAverageWatchDuration(mediaID: number): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/WatchDuration/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

/**
* Get all open or played media items from a user (for the user engagement table in the analytics report page)
*/
  getOpenedOrPlayedMedia(userID: string): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/OpenOrPlayed/' + userID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
