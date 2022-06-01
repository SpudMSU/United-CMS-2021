import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Media } from '../models/media';
import { DistanceLearningSession } from '../models/distance-learning-session';
import { Channel } from '../models/channel';
import { DistanceLearningMedia } from '../models/distance-learning-media';


/**
 * Author: Shawn Pryde
 *
 * Acts as an intermediary between the angular front-end and
 * .NET Core back-end. Provides a way for angular components
 * to acquire media item information from the database
 *
 * NOTE: the structure of this service must be made in conjunction
 * with the MediaLibraryController file
 * */
@Injectable({
  providedIn: 'root'
})
export class MediaService extends DatabaseService {
  // route to add to the origin route which gets us to the media library
  // http request acceptor
  _apiRoute: string
  _distanceLearningSession: string

  constructor(private _http: HttpClient) {
    super()
    // if this value is not assigned in the constructor, the compiler will think it's null
    this._apiRoute = '/api/MediaLibrary'
    this._distanceLearningSession = '/distanceLearningSession'
  }

  /**
   * Get all media items
   * */
  getAllItems(): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Get a specific media item
   * @param id media id of the desired item
   */
  getMedia(id: number): Observable<Media> {
    return this._http.get<Media>(this._apiBaseUrl + this._apiRoute + '/' + id)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add a new media item to the database
   * (Not yet tested)
   * @param media item to add
   */
  submitNewMedia(media: Media): Observable<Media> {
    return this._http.post<Media>(this._apiBaseUrl + this._apiRoute, JSON.stringify(media), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add new distance learning media item to the DB (must have mediaId)
   * @param media DistanceLearningMedia item to add to DB (must have mediaId field filled)
   */
  AddNewDistanceLearningMedia(media: DistanceLearningMedia): Observable<any> {
    return this._http.post<DistanceLearningMedia>(this._apiBaseUrl + this._apiRoute + "/distanceLearning", JSON.stringify(media), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  updateDistanceLearningMedia(media: DistanceLearningMedia): Observable<any> {
    return this._http.put<DistanceLearningMedia>(this._apiBaseUrl + this._apiRoute + "/distanceLearning", JSON.stringify(media), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  /**
    * Update a media item in the database
    * @param id id of the item to update
    * @param media item to update
    */
  updateMedia(id: number, media: Media): Observable<Media> {
    console.log([id, media])
    let result = this._http.put<Media>(this._apiBaseUrl + this._apiRoute + '/' + id, JSON.stringify(media), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
    return result
  }

  updateMediaCommentingEnabled(id: number, enabled: boolean): Observable<any> {
    return this._http.put(this._apiBaseUrl + this._apiRoute + "/" + id + "/commenting/" + enabled, {})
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove a media item from the database
   * @param mediaID id of the item to delete
   */
  deleteMedia(mediaID: number): Observable<Media> {
    return this._http.delete<Media>(this._apiBaseUrl + this._apiRoute + '/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Getter for a list of media items based on a
   * provided search query.
   * Includes an option to show retired media
   * @param searchQuery
   * @param retiredMedia
   */
  searchForMediaByTitle(searchQuery: string, showRetiredMedia: boolean = false): Observable<Media[]> {
    var find = '/#?';
    var re = new RegExp(find, 'g');
    var resultQuery = searchQuery.replace(re, '_');
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/search/' + resultQuery + '/' + showRetiredMedia)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Getter for a list of Media items based on a
   * provided list of pairs:
   * key = search query
   * value = column type
   * @param searchQueries
   * @param columns
   */
  multiParameterMediaSearch(searchQueries: string[], columns: string[]): Observable<Media[]> {
    // error check
    if (searchQueries.length != columns.length) {
      return throwError("Error searching for media, each search query must have a matching column to search under");
    }
    // build the route call
    var searchRoute = this._apiBaseUrl + this._apiRoute + '/searchMultiParam?';
    for (var i = 0; i < searchQueries.length; i++) {
      searchRoute += "tokenStrings=" + searchQueries[i] + "&";
    }
    for (var i = 0; i < columns.length; i++) {
      searchRoute += "columnNames=" + columns[i];
      if (i < columns.length - 1) {
        searchRoute += "&";
      }
    }
    // make the call
    return this._http.get<Media[]>(searchRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getAllLocations(): string[] {
    var locations: string[] = [];
    return locations;
  }

  /**
   * Getter for the list of channels associated with a
   * specific media
   * @param mediaID
   */
  getChannelsOfMedia(mediaID: number): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute + '/channels/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   *
   *  Distance Learning Media
   * 
   */
  
  /**
   * Getter for the list of tech talk sessions associated with a
   * specified tech talk media item
   * @param mediaID id of the tech talk to get links for
   */
  getDistanceLearningSessions(mediaID: number): Observable<DistanceLearningSession[]> {
    return this._http.get<DistanceLearningSession[]>(this._apiBaseUrl + this._apiRoute + '/distanceLearningSessions/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getDistanceLearningMedia(mediaId: number): Observable<DistanceLearningMedia> {
    return this._http.get<DistanceLearningMedia>(this._apiBaseUrl + this._apiRoute + "/distanceLearning/" + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add a new tech talk session to the database
   * @param session item to add
   */
  submitNewDistanceLearningSession(session: DistanceLearningSession): Observable<DistanceLearningSession> {
    return this._http.post<DistanceLearningSession>(this._apiBaseUrl + this._apiRoute + this._distanceLearningSession, JSON.stringify(session), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Update a techTalkSession in the database
  * @param id id of the session to update
  * @param techTalkSession session to update
  */
  updateDistanceLearningSession(id: number, distanceLearningSession: DistanceLearningSession): Observable<DistanceLearningSession> {
    return this._http.put<DistanceLearningSession>(this._apiBaseUrl + this._apiRoute + this._distanceLearningSession + '/' + id, JSON.stringify(distanceLearningSession), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove a techTalkSession from the database
   * @param techTalkSessionID id of the item to delete
   */
  deleteDistanceLearningSession(distanceLearningSessionId: number): Observable<DistanceLearningSession> {
    return this._http.delete<DistanceLearningSession>(this._apiBaseUrl + this._apiRoute + this._distanceLearningSession + '/' + distanceLearningSessionId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
