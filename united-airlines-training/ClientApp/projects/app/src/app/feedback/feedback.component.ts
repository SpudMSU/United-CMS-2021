/*
  Author: Chris Nosowsky
*/
import { Component, OnInit, Input } from '@angular/core';
import { FeedbackService } from '../services/feedback.service';
import { GeneralFeedback } from '../models/general-feedback';
import { UserService } from '../services/user.service';
import { Media } from '../models/media';
import { MediaFeedback } from '../models/media-feedback';
import { User } from '../models/user';
import { UserFeedbackData } from '../models/user-feedback-data';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  @Input() mediaFeedback: boolean = false; // Comes from media item page feedback form
  @Input() media: Media;  // Comes from media item page feedback form
  @Input() contact: boolean = false;  // Comes from the contact form on the help page
  
  feedbackTypeText = "You can send general feedback about the website on this page."  // Will be changed for media feedback
  feedbackPlaceHolder: string = "Enter Feedback Here"
  placeHolder: string = "e.g. 999-999-9999"
  feedbackTitle: string = "Send Feedback"
  data: any;
  user: User
  feedback: UserFeedbackData = { gFeedback: null, mFeedback: null, uFeedback: null, phone: null } // init data
  feedbackData: any = { // init data
    email: "",
    lname: "",
    fname: "",
    uid: ""
  }
  phoneInput: string = "";  // ngmodel updates this for the optional phone number field

  submitted = false;  // Determines whether or not the form has been submitted
  success = false;    // Determines if successfully submitted form and no API errors arise.
  disabledEmail = true  // Email is disabled unless header information and back end doesn't contain email

  feedbackForm: FormGroup = new FormGroup({
    FeedbackText: new FormControl('',
      [
        Validators.required,
      ]),
    Email: new FormControl({value: '', disabled: true},
      [
        Validators.required,
        Validators.pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
      ]),
    Subject: new FormControl('',
      [
      ]),
  });

/**
 * Constructor initializes all services used
 */
  constructor(private _feedbackService: FeedbackService, private _userService: UserService) { }

/**
 * Component initialize function
 */
  ngOnInit(): void {

    // setting subject section validator to require subject section
    this.feedbackForm.controls["Subject"].setValidators([Validators.required]);
    this.feedbackForm.controls["Subject"].updateValueAndValidity();

    // Change some title and place holder information if it is the contact form from the help page
    if (this.contact) {
      this.feedbackTitle = "Contact Us"
      this.feedbackTypeText = ""
      this.feedbackPlaceHolder = "Enter contact details..."
    }
    else if (this.mediaFeedback) {
      this.feedbackTypeText = "You can send media feedback on this page."
    }
    this._userService.getCurrentUser().subscribe(data => {
      this.feedbackData.uid = data["uid"] ?? "NONE FOUND"
      this.feedbackData.email = data["email"] ?? "NONE FOUND"
      this.feedbackData.lname = data["lastName"] ?? "NONE FOUND"
      this.feedbackData.fname = data["firstName"] ?? "NONE FOUND"
      this.user = data
      if (this.feedbackData.email == "NONE FOUND")
        this._userService.getUser(this.feedbackData.uid).subscribe(res => {
          if (res["email"] != null) {
            this.feedbackData.email = res["email"]
            this.user["email"] = res["email"]
          }
          else {
            this.feedbackForm.get("Email").enable();
            this.disabledEmail = false
            this.feedbackData.email = ""
          }
        })
    })
  }

/**
 * Clear input when input is clicked on
 */
  ClearForInput() {
    if (this.feedbackForm.get('FeedbackText').value == "Type Here") {
      this.feedbackForm.get('FeedbackText').setValue("")
    }
  }

/**
 * Function for submitting the form feedback to the back end and processing it as an email
 */
  SubmitFeedback() {
    this.submitted = true

    if (!this.disabledEmail) {
      this.feedbackData.email = this.feedbackForm.get('Email').value
      this.user.email = this.feedbackData.email;
    }

    this.feedback.uFeedback = this.user
    this.feedback.phone = this.phoneInput

    let gfeedbackData: GeneralFeedback = {
      createdAt: new Date(),
      uid: this.feedbackData.uid,
      description: this.feedbackForm.get('FeedbackText').value
    }
    this.feedback.subject = this.feedbackForm.get('Subject').value
    this.feedback.gFeedback = gfeedbackData
    this.feedback.mediatitle = null

    if (this.contact) {
      this._feedbackService.sendContactEmail(this.feedback).subscribe(data => {
        this.data = data
        this.success = true
      }, error => {
          console.log(error)
      })
    }

    else if (this.mediaFeedback) {
      let mfeedbackData: MediaFeedback = {
        mediaId: this.media.mediaID,
        uid: this.feedbackData.uid,
        createdAt: new Date(),
        description: this.feedbackForm.get('FeedbackText').value
      }

      this.feedback.mFeedback = mfeedbackData
      this.feedback.mediatitle = this.media.title

      this._feedbackService.sendMediaFeedback(this.feedback).subscribe(data => {
        this.data = data
        this.success = true;
      }, error => {
        console.log(error)
      })

    } else {
      this._feedbackService.sendGeneralFeedback(this.feedback).subscribe(data => {
        this.data = data
        this.success = true;
      }, error => {
        console.log(error)
      })
    }
    if (this.feedbackForm.get('FeedbackText').value == "Type Here") {
      this.feedbackForm.get('FeedbackText').setValue("")
    }
  }

}
