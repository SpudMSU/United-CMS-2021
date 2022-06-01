import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangedChannel } from '../models/changed-channel';
import { DatabaseService } from './database.service';
@Injectable({
  providedIn: 'root'
})
export class ChangedChannelService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {

    super();
    console.log("constructor works");
    this._apiRoute = '/api/ChangedChannel';
  }

  getChangedChannel(index: number): Observable<ChangedChannel> {
    return this._http.get<ChangedChannel>(this._apiBaseUrl + this._apiRoute + '/' + index)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  putChangedChannel(entry: ChangedChannel) {
    return this._http.put<ChangedChannel>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  postChangedChannel(entry: ChangedChannel, rec = false): Observable<ChangedChannel> {
    let result = this._http.post<ChangedChannel>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
    return result;
  }


}
