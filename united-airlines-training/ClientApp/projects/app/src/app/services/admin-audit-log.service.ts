import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { AdminAuditLog } from '../models/admin-audit-log';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminAuditLogService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {
    super();
    this._apiRoute = '/api/AdminAuditLog'
  }

  getAdminAuditLog(): Observable<AdminAuditLog[]> {
    return this._http.get<AdminAuditLog[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  getNumEntries(): Observable<any> {
    return this._http.get<any>(this._apiBaseUrl+ this._apiRoute + "/count")
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getEntry(index: number): Observable<AdminAuditLog> {
    return this._http.get<AdminAuditLog>(this._apiBaseUrl + this._apiRoute + "/" + index)
      .pipe(catchError(err => {
        console.log(err)
        return throwError(err);
      }))
  }

  createEntry(entry: AdminAuditLog): Observable<AdminAuditLog> {
    let result = this._http.post<AdminAuditLog>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        this.getNumEntries().subscribe(num => {
          if (entry.id < num["count"]) {
            return this.createEntry(entry);
          }
            })
        return throwError(err); 
      }))
    return result;
  }

  Revert(entry: AdminAuditLog): Observable<AdminAuditLog> {
    console.log(entry);
    let result = this._http.put<AdminAuditLog>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        console.log(err);
        return throwError(err);
      }))
    result.subscribe(data => {
      console.log(data)
    })
    return result;
  }
  searchForLogs(searchQueries: string[], columns: string[]): Observable<AdminAuditLog[]> {
    // error check
    if (searchQueries.length != columns.length) {
      return throwError("Error searching for users, each search query must have a matching column to search under");
    }
    // build the route call
    var searchRoute = this._apiBaseUrl + this._apiRoute + '/search?';
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
    return this._http.get<AdminAuditLog[]>(searchRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
