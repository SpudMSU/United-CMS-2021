import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangedUser } from '../models/changed-user';
import { DatabaseService } from './database.service';
@Injectable({
  providedIn: 'root'
})
export class ChangedUserService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {

    super();
    console.log("constructor works");
    this._apiRoute = '/api/ChangedUser';
  }

  getChangedUser(index: number): Observable<ChangedUser> {
    return this._http.get<ChangedUser>(this._apiBaseUrl + this._apiRoute + '/' + index)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  putChangedUser(entry: ChangedUser) {
    return this._http.put<ChangedUser>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  postChangedUser(entry: ChangedUser, rec = false): Observable<ChangedUser> {
    let result = this._http.post<ChangedUser>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
    return result;
  }


}
