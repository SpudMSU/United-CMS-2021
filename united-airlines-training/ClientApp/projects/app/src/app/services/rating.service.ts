/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { Rating } from '../models/rating';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class RatingService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/Rating'
  }


  /*
    Rating CRUD Functions
  */

  // Get all ratings
  getRatings(): Observable<Rating[]> {
    return this._http.get<Rating[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Get all ratings for a particular user
  getAllUserRatings(id: string): Observable<Rating[]> {
    return this._http.get<Rating[]>(this._apiBaseUrl + this._apiRoute + '/user/' + id)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific rating
  getRating(id: string, mediaId: number): Observable<Rating> {
    return this._http.get<Rating>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific media likes and dislikes
  getMediaRatingLikesAndDislikes(mediaId: number): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRoute + '/media/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific user like or dislike on a particular media
  getUserMediaRating(mediaId: number, uid: string): Observable<Rating> {
    return this._http.get<Rating>(this._apiBaseUrl + this._apiRoute + '/media/' + mediaId + '/user/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }



  // Create rating
  createRating(rating: Rating): Observable<Rating> {
    return this._http.post<Rating>(this._apiBaseUrl + this._apiRoute, JSON.stringify(rating), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Update a specific rating
  updateRating(id: string, mediaId: number, rating: Rating): Observable<Rating> {
    return this._http.put<Rating>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId, JSON.stringify(rating), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Delete a specific rating
  deleteRating(id: string, mediaId: number): Observable<Rating> {
    return this._http.delete<Rating>(this._apiBaseUrl + this._apiRoute + '/user/' + id + '/media/' + mediaId)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
