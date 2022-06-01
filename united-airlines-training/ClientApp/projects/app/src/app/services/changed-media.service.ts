import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangedMedia } from '../models/changed-media';
import { DatabaseService } from './database.service';
@Injectable({
  providedIn: 'root'
})
export class ChangedMediaService extends DatabaseService {

  _apiRoute: string

  constructor(private _http: HttpClient) {
    
    super();
    console.log("constructor works");
    this._apiRoute = '/api/ChangedMedia';
  }

  getChangedMedia(index: number): Observable<ChangedMedia> {
    return this._http.get<ChangedMedia>(this._apiBaseUrl + this._apiRoute + '/' + index)
      .pipe(catchError(err => {
      return throwError(err);
    }))
  }

  putChangedMedia(entry: ChangedMedia) {
    return this._http.put<ChangedMedia>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
  postChangedMedia(entry: ChangedMedia, rec = false): Observable<ChangedMedia> {
    let result =  this._http.post<ChangedMedia>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
    return result;
  }
  

}
