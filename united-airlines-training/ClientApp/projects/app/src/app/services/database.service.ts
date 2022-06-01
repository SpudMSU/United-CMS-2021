import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 *  Author: Shawn Pryde
 *  Created: 10/08/2020
 *
 *  Acts as the base class for all services which interact with our database
 * */
@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  // base url path for getting to the parent of the api folder
  _apiBaseUrl: string = '';

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
    })
  };

  constructor()
  {
    this._apiBaseUrl = environment.ApiBaseUrl
  }
}
