import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { MediaType } from '../models/media-type';

/**
 * Author: Shawn Pryde
 *
 * Acts as an intermediary between the angular front-end and
 * .NET Core back-end. Provides a way for angular components
 * to acquire media type information from the database
 *
 * NOTE: the structure of this service must be made in conjunction
 * with the MediaTypesController file
 * */
@Injectable({
  providedIn: 'root'
})
export class MediaTypeService extends DatabaseService{

  // route to add to the origin route which gets us to the http request acceptor
  _apiRoute: string

  constructor(private _http: HttpClient) {
    super()
    // if this value is not assigned in the constructor, the compiler will think it's null
    this._apiRoute = '/api/MediaTypes'
  }

  /**
   * Get all possible media types
   * */
  getAllMediaTypes(): Observable<MediaType[]> {
    return this._http.get<MediaType[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Get a specific media typeget
  * @param typeID id of the desired channel
  */
  getMediaType(typeID: number): Observable<MediaType> {
    return this._http.get<MediaType>(this._apiBaseUrl + this._apiRoute + '/' + typeID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * update a MediaType which already exists in the database
   * @param typeID id of the MediaType
   * @param mediaType new data to hold for the MediaType
   */
  updateMediaType(typeID: number, mediaType: MediaType): Observable<MediaType> {
    return this._http.put<MediaType>(this._apiBaseUrl + this._apiRoute + '/' + typeID, JSON.stringify(mediaType), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Add a new MediaType to the database
  * (Not yet tested, you may not even
  * want to do this ever)
  * @param mediaTyper MediaType to add
  */
  createNewMediaType(mediaTyper: MediaType): Observable<MediaType> {
    return this._http.post<MediaType>(this._apiBaseUrl + this._apiRoute, JSON.stringify(mediaTyper), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  /**
   * Remove a MediaType from the database
   * @param typeID id of the MediaType to delete
   */
  deleteMediaType(typeID: number): Observable<MediaType> {
    return this._http.delete<MediaType>(this._apiBaseUrl + this._apiRoute + '/' + typeID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
