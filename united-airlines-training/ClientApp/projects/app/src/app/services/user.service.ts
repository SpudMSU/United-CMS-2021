/*
  Author: Chris Nosowsky
  Created: 10-13-2020
*/
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject } from 'rxjs';
import { User } from '../models/user';
import { UserHistory } from '../models/user-history';
import { DatabaseService } from './database.service';
import { DepCostLoc } from '../models/depCostLoc';

@Injectable({
  providedIn: 'root'
})
export class UserService extends DatabaseService {

  _apiRouteUser
  _apiRouteUserHistory
  _apiRouteInfo
  constructor(private _http: HttpClient) {
    super();
    this._apiRouteUser = '/api/User'
    this._apiRouteUserHistory = '/api/UserHistories'
    this._apiRouteInfo = '/api/User/LocDepCost/'
  }

  // Get current UID
  getCurrentUserID(): Observable<string> {
    return this._http.get<string>(this._apiBaseUrl + '/api/User/uid')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get current User (all attributes)
  getCurrentUser(): Observable<User> {
    return this._http.get<User>(this._apiBaseUrl + '/api/User/CurrentUser')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Get distinct employment status symbols (ex: A = Active)
  getDistinctEmploymentStatus(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + '/api/User/EmploymentStatus')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getAllFlags(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + "/api/User/FlagInfo")
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  /*
    User CRUD Functions
  */

  // Get all users
  getUsers(): Observable<User[]> {
    return this._http.get<User[]>(this._apiBaseUrl + '/api/User')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Checks if user exists in backend. If not, it creates that user. If it does, it will check if it needs attributes to be updated.
  // THIS FUNCTION IS ONLY FOR OAM CHECK
  checkIfUserExists(uid: string): Observable<User> {
    return this._http.get<User>(this._apiBaseUrl + this._apiRouteUser + '/check/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific user
  getUser(uid : string): Observable<User> {
    return this._http.get<User>(this._apiBaseUrl + this._apiRouteUser + '/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Create specific user
  createUser(user: User): Observable<User> {
    return this._http.post<User>(this._apiBaseUrl + this._apiRouteUser, JSON.stringify(user), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Update a specific user
  updateUser(uid: string, user: User): Observable<User> {
    return this._http.put<User>(this._apiBaseUrl + this._apiRouteUser + '/' + uid, JSON.stringify(user), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Delete specific user
  deleteUser(uid: string): Observable<User> {
    return this._http.delete<User>(this._apiBaseUrl + this._apiRouteUser + '/' + uid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Getter for a list of Users based on a
   * provided search query and column type
   * @param searchQueries
   */
  searchForUsers(searchQueries: string[], columns: string[]): Observable<User[]> {
    // error check
    if (searchQueries.length != columns.length) {
      return throwError("Error searching for users, each search query must have a matching column to search under");
    }
    // build the route call
    var searchRoute = this._apiBaseUrl + this._apiRouteUser + '/search?';
    for (var i = 0; i < searchQueries.length; i++) {
      searchRoute += "tokenStrings="+searchQueries[i]+"&";
    }
    for (var i = 0; i < columns.length; i++) {
      searchRoute += "columnNames=" + columns[i];
      if (i < columns.length - 1) {
        searchRoute += "&";
      }
    }
    // make the call
    return this._http.get<User[]>(searchRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  /*
    UserHistory CRUD Functions
  */

  // Get all user histories for a particular media item
  getMediaHistory(mediaid: number): Observable<UserHistory[]> {
    return this._http.get<UserHistory[]>(this._apiBaseUrl + this._apiRouteUserHistory + '/' + mediaid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get media views
  getMediaViews(mediaid: number): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl + this._apiRouteUserHistory + '/' + mediaid + '/views')
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get all users history
  getUsersHistory(): Observable<UserHistory[]> {
    return this._http.get<UserHistory[]>(this._apiBaseUrl + this._apiRouteUserHistory)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific user history based on user and media watched
  getUserHistory(uid: string, mediaid: number): Observable<UserHistory> {
    return this._http.get<UserHistory>(this._apiBaseUrl + this._apiRouteUserHistory + '/' + uid + '/' + mediaid)
      .pipe(catchError(err => {
        return throwError(err);
      }))




  }

  // Create specific user history
  createUserHistory(userhistory: UserHistory): Observable<UserHistory> {
    return this._http.post<UserHistory>(this._apiBaseUrl + this._apiRouteUserHistory, JSON.stringify(userhistory), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Update a specific user history
  updateUserHistory(userhistory: UserHistory): Observable<UserHistory> {
    return this._http.put<UserHistory>(this._apiBaseUrl + this._apiRouteUserHistory, JSON.stringify(userhistory), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Delete specific user history
  deleteUserHistory(uid: string, mediaid: number): Observable<UserHistory> {
    return this._http.delete<UserHistory>(this._apiBaseUrl + this._apiRouteUserHistory + '/' + uid + '/' + mediaid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getDepartmentCostLocation(): Observable<DepCostLoc> {
    return this._http.get<DepCostLoc>(this._apiBaseUrl + this._apiRouteInfo)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
