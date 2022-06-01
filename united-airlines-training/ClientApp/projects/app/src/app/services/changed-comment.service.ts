import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChangedComment } from '../models/changed-comment';
import { DatabaseService } from './database.service';
@Injectable({
    providedIn: 'root'
})
export class ChangedCommentService extends DatabaseService {

    _apiRoute: string

    constructor(private _http: HttpClient) {

        super();
        console.log("constructor works");
        this._apiRoute = '/api/ChangedComment';
    }

    getChangedComment(index: number): Observable<ChangedComment> {
        return this._http.get<ChangedComment>(this._apiBaseUrl + this._apiRoute + '/' + index)
            .pipe(catchError(err => {
                return throwError(err);
            }))
    }

    putChangedComment(entry: ChangedComment) {
        return this._http.put<ChangedComment>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
            .pipe(catchError(err => {
                return throwError(err);
            }))
    }
    postChangedComment(entry: ChangedComment, rec = false): Observable<ChangedComment> {
        let result = this._http.post<ChangedComment>(this._apiBaseUrl + this._apiRoute, JSON.stringify(entry), this.httpOptions)
            .pipe(catchError(err => {
                return throwError(err);
            }))
        return result;
    }


}
