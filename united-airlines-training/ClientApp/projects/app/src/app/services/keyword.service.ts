import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Channel } from '../models/channel';
import { Keyword } from '../models/keyword';
import { Media } from '../models/media';

/**
 * Author: Shawn Pryde
 *
 * Acts as an intermediary between the angular front-end and
 * .NET Core back-end. Provides a way for angular components
 * to acquire keyword information from the database
 *
 * NOTE: the structure of this service must be made in conjunction
 * with the KeywordController file
 * */
@Injectable({
  providedIn: 'root'
})
export class KeywordService extends DatabaseService {
  // route to add to the origin route which gets us to the http request acceptor
  _apiRoute: string

  constructor(private _http: HttpClient) {
    super()
    // if these values are not assigned in the constructor, the compiler will think they're null
    this._apiRoute = '/api/Keyword'
  }

  /**
   * Get all keywords
   * */
  getAllKeywords(): Observable<Keyword[]> {
    return this._http.get<Keyword[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getKeyword(word: string): Observable<Keyword> {
    return this._http.get<Keyword>(this._apiBaseUrl + this._apiRoute + "/byWord/" + word)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add a new keyword to the database
   * (Not yet tested)
   * @param keyword Keyword to add
   */
  createNewKeyword(keyword: Keyword): Observable<Keyword> {
    return this._http.post<Keyword>(this._apiBaseUrl + this._apiRoute, JSON.stringify(keyword), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * update a keyword which already exists in the database
   * @param keywordID id of the keyword
   * @param keywordObject new data to hold for the keyword
   */
  updateKeyword(keywordID: number, keywordObject: Keyword): Observable<Keyword> {
    return this._http.put<Keyword>(this._apiBaseUrl + this._apiRoute + '/' + keywordID, JSON.stringify(keywordObject), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove a Keyword from the database
   * @param keywordID id of the Keyword to delete
   */
  deleteKeyword(keywordID: number): Observable<Keyword> {
    return this._http.delete<Keyword>(this._apiBaseUrl + this._apiRoute + '/' + keywordID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Gets the list of channels that are associated with
  * the provided keyword
  * @param keywordID 
  */
  getChannelsWithKeyword(keywordID: number): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute + '/channels/' + keywordID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Gets the list of media items that are associated with
  * the provided keyword
  * @param keywordID 
  */
  getMediasWithKeyword(keywordID: number): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/media/' + keywordID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Gets the list of keywords that are associated with
  * the provided media id
  * @param mediaID 
  */
  getKeywordsOfMedia(mediaID: number): Observable<Keyword[]> {
    return this._http.get<Keyword[]>(this._apiBaseUrl + this._apiRoute + '/keywordsOfMedia/' + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Gets the list of keywords that are associated with
  * the provided channel id
  * @param channelID 
  */
  getKeywordsOfChannel(channelID: number): Observable<Keyword[]> {
    return this._http.get<Keyword[]>(this._apiBaseUrl + this._apiRoute + '/keywordsOfChannel/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Connect a keyword and media item
   * @param mediaID
   * @param keywordID
   */
  associateKeywordAndMedia(mediaID: number, keywordID: number): Observable<boolean> {
    return this._http.post<boolean>(this._apiBaseUrl + this._apiRoute + '/addKeyword/media/' + mediaID + '/' + keywordID, this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove the relationship between a keyword and media item
   * @param keywordID
   * @param mediaID
   */
  removeKeywordMedia(keywordID: number, mediaID: number): Observable<object> {
    return this._http.delete<object>(this._apiBaseUrl + this._apiRoute + '/removeKeyword/media/' + keywordID + "/" + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Connect a keyword and channel item
   * @param channelID
   * @param keywordID
   */
  associateKeywordAndChannel(channelID: number, keywordID: number): Observable<boolean> {
    return this._http.post<boolean>(this._apiBaseUrl + this._apiRoute + '/addKeyword/channel/' + channelID + '/' + keywordID, this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove the relationship between a keyword and channel
   * @param keywordID
   * @param channelID
   */
  removeKeywordChannel(keywordID: number, channelID: number): Observable<object> {
    return this._http.delete<object>(this._apiBaseUrl + this._apiRoute + '/removeKeyword/channel/' + keywordID + "/" + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

}
