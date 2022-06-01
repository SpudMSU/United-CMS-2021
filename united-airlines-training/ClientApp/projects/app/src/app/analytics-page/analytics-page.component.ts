/*
  Author: Chris Nosowsky
*/
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MediaService } from '../services/media.service';
import { UserService } from '../services/user.service'
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Media } from '../models/media';
import { environment } from '../../environments/environment';
import { DepCostLoc } from '../models/depCostLoc'
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})

export class AnalyticsPageComponent implements OnInit {
  locationControl = new FormControl();
  costControl = new FormControl();
  departmentControl = new FormControl();

  results: Media[] = [];


  SitePath: string = environment.SitePath;

  // User form group for the UID section
  userform: FormGroup = new FormGroup({
    UIDInput: new FormControl('',
      [
        Validators.required,
        Validators.minLength(7)
      ]),
  });

  // User form group for the first name, last name, email section
  userAltform: FormGroup = new FormGroup({
    FirstName: new FormControl('',
      [
        //Validators.required,
      ]),
    LastName: new FormControl('',
      [
        //Validators.required,
      ]),
    // Below pattern is an email pattern using regular expression commands
    Email: new FormControl('',
      [
        Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ]),
  });

  // Media form group for the media ID section
  mediaform: FormGroup = new FormGroup({
    mediaIDInput: new FormControl('',
      [
        Validators.required,
        Validators.pattern("^[0-9]*$")
      ]),
  })

  // Media form group for the title section
  mediaAltform: FormGroup = new FormGroup({
    mediaTitleInput: new FormControl('',
      [
        Validators.required
      ]),
  })

  mediaOptions = [{id: 0, title: ""}];
  mediaTitle: string = ""

  constructor(private _mediaService: MediaService, private _userService: UserService, private http : HttpClient) { }

/**
 * Component initialize function
 */
  ngOnInit() {
    // set the validators for user alt form
    this.userAltform.setValidators(this.requireAtleastOneField())

    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    this._mediaService.getAllItems().subscribe(res => {
      for (let media of res) {
        if (media.mediaStatus == 'A') {
          this.mediaOptions.push({ id: media.mediaID, title: media.title });          
        }         
      }

      this.mediaOptions = this.mediaOptions.sort((a, b) => {
        if (a.title > b.title)
          return 1
        if (a.title < b.title)
          return -1
        return 0
      })
      //console.log(this.mediaOptions)
    })
  }

/**
 * Encode the URL
 */
  encodeVal(val: string): string {
    if (val == "") {
      val = null
    }
    
    return encodeURIComponent(val);
  }

  getMediaReport(): string {
    var val = this.mediaAltform.get('mediaTitleInput').value;
    if (val == "") {
      val = null
    }
    
    this.mediaOptions.forEach(value => {
      if (value.title.trim() == val.trim())
        window.location.assign("/#/report/media/"+value.id)
    })
 

    return '0';
  }

/**
 * Some things to consider here. This is for the second form under user engagement report.
 * 1. First name and last name are required if email not provided
 * 2. Email only works
 * 3. Last name only works
 */
  requireAtleastOneField() {
    return (controlGroup) => {
      var controls = controlGroup.controls;
      if (controls) {
        var fieldEnteredFound = Object.keys(controls).find(key => (controls["FirstName"].value !== ''
          && controls["LastName"].value !== '')
          || controls["Email"].value !== ''
          || controls["LastName"].value !== '');
        if (!fieldEnteredFound) {
          return { atLeastOneRequired: { text: 'At least one field needs to be selected' } }
        }
      }
      return null;
    };
  };
}
