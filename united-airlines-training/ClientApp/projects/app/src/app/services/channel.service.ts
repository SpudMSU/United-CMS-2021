import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { DatabaseService } from './database.service';
import { Channel } from '../models/channel';
import { Media } from '../models/media';
import { NestedChannel } from '../models/nested-channel';

/**
 * Author: Shawn Pryde
 *
 * Acts as an intermediary between the angular front-end and
 * .NET Core back-end. Provides a way for angular components
 * to acquire channel information from the database
 *
 * NOTE: the structure of this service must be made in conjunction
 * with the ChannelController file
 * */
@Injectable({
  providedIn: 'root'
})
export class ChannelService extends DatabaseService {

  // route to add to the origin route which gets us to the http request acceptor
  _apiRoute: string
  _nestedApiRoute: string

  constructor(private _http: HttpClient) {
    super()
    // if these values are not assigned in the constructor, the compiler will think they're null
    this._apiRoute = '/api/Channel'
    this._nestedApiRoute = '/api/NestedChannel'
  }

  /**
   * Get all root channels (channels which have no parent)
   * */
  getRootChannels(): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Get all channels 
   * */
  getAllChannels(): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute + "/all")
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
    * Get a specific channel
    * @param channelID id of the desired channel
    */
  getChannel(channelID: number): Observable<Channel> {
    return this._http.get<Channel>(this._apiBaseUrl + this._apiRoute + '/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add a new channel to the database
   * (Not yet tested)
   * @param channel Channel to add
   */
  createNewChannel(channel: Channel): Observable<Channel> {
    return this._http.post<Channel>(this._apiBaseUrl + this._apiRoute, JSON.stringify(channel), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  RevertChannel(channel: Channel): Observable<Channel> {
    return this._http.post<Channel>(this._apiBaseUrl + this._apiRoute + '/revert', JSON.stringify(channel), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * update a channel which already exists in the database
   * @param channelID id of the channel
   * @param channelObject new data to hold for the channel
   */
  updateChannel(channelID: number, channelObject: Channel): Observable<Channel> {
    return this._http.put<Channel>(this._apiBaseUrl + this._apiRoute + '/' + channelID, JSON.stringify(channelObject), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove a Channel from the database
   * @param channelID id of the Channel to delete
   */
  deleteChannel(channelID: number): Observable<Channel> {
    return this._http.delete<Channel>(this._apiBaseUrl + this._apiRoute + '/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
  * Get the media items of a specific channel
  * @param channelID id of the channel to get media from
  */
  getChannelMedia(channelID: number): Observable<Media[]> {
    return this._http.get<Media[]>(this._apiBaseUrl + this._apiRoute + '/media/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Add a new channel media connection to the database
   * @param channel Channel to connect the media to
   * @param media the media to connect to the given channel
   */
  addChannelMedia(channelID: number, media: Media): Observable<Channel> {
    return this._http.post<Channel>(this._apiBaseUrl + this._apiRoute + '/addMedia/' + channelID, JSON.stringify(media), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * 
   * @param channelID
   * @param mediaID
   */
  removeChannelMedia(channelID: number, mediaID: number): Observable<object> {
    return this._http.delete<object>(this._apiBaseUrl + this._apiRoute + '/removeMedia/' + channelID + "/" + mediaID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  //
  // Channel "parent-child" relationships
  //

  /**
  * Get the channels which are nested beneath the current channel
  * @param channelID id of the channel to get children of
  */
  getChannelChildren(channelID: number): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._nestedApiRoute + '/children/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Creates a parent-child relationship between
   * two channels in the database
   * @param channel Channel to add
   */
  connectChannels(parentID: number, childID: number): Observable<NestedChannel> {
    // create the relationship
    var newNestRel: NestedChannel = {
      parentId: parentID,
      childId: childID
    };
    // send it to the backend
    return this._http.post<NestedChannel>(this._apiBaseUrl + this._nestedApiRoute, JSON.stringify(newNestRel), this.httpOptions)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove a NestedChannel relationship from the database
   * @param parentID
   * @param childID
   */
  deleteRelationship(parentID: number, childID: number): Observable<NestedChannel> {
    return this._http.delete<NestedChannel>(this._apiBaseUrl + this._nestedApiRoute + '/singleRelation/' + parentID + '/' + childID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  /**
   * Remove all relationships which involve a specified channel from the database.
   * If the channel had a parent, any of its children will be assigned to that parent.
   * @param channelID id of the channel whose relationships we want to remove
   */
  deleteAllRelationships(channelID: number): Observable<NestedChannel> {
    return this._http.delete<NestedChannel>(this._apiBaseUrl + this._nestedApiRoute + '/allRelations/' + channelID)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getAllOnLevel(channelID: number): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute + '/getParent/' + channelID).pipe(catchError(err => {
      return throwError(err);
    }))
  }



  /**
   * Getter for a list of media items based on a
   * provided search query
   * @param searchQuery
   */
  searchForChannelsByTitle(searchQuery: string): Observable<Channel[]> {
    return this._http.get<Channel[]>(this._apiBaseUrl + this._apiRoute + '/search/' + searchQuery)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }

  getChannelRelationships(): Observable<NestedChannel[]> {
    return this._http.get<NestedChannel[]>(this._apiBaseUrl + this._nestedApiRoute)
      .pipe(catchError(err => {
        return throwError(err);
      }))
  }
}
