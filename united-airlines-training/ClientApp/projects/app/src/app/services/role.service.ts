/*
  Author: Chris Nosowsky
  Created: 10-28-2020
*/
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { Role } from '../models/role';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/Role'
  }


  /*
    Role CRUD Functions
  */

  // Get all role
  getRoles(): Observable<Role[]> {
    return this._http.get<Role[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Get specific role
  getRole(roleid: number): Observable<Role> {
    return this._http.get<Role>(this._apiBaseUrl + this._apiRoute + '/' + roleid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Create role
  createRole(role: Role): Observable<Role> {
    return this._http.post<Role>(this._apiBaseUrl + this._apiRoute, JSON.stringify(role), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }


  // Update a specific role
  updateRole(roleid: number, role: Role): Observable<Role> {
    return this._http.put<Role>(this._apiBaseUrl + this._apiRoute + '/' + roleid, JSON.stringify(role), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  // Delete a specific role
  deleteRole(roleid: number): Observable<Role> {
    return this._http.delete<Role>(this._apiBaseUrl + this._apiRoute + '/' + roleid)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

}
