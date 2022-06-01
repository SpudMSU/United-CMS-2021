import { Component, OnInit, EventEmitter } from '@angular/core';
import { UserService } from './services/user.service';
import { environment } from '../environments/environment';
import { User } from './models/user'
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

export let browserRefresh = false;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  userRole: number = 0;
  subscription: Subscription;

/**
* Constructor that defines services used in component
*/
  constructor(private _userService: UserService, private router: Router) {

    // This is really only used on media page. It determines if page has been refreshed
    // or not to check if it needs to update media item history
    this.subscription = router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        browserRefresh = !router.navigated;
      }
    });
  }

/**
* Component initialize function
*/
  ngOnInit() {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.checkRoleLevel()
      }
    });
  }

/**
* Check role level on every route change
*/
  checkRoleLevel() {
    this._userService.getCurrentUserID().subscribe(data => {
      this._userService.checkIfUserExists(data.toString()).subscribe(data => {
        this.userRole = data.roleCode
        localStorage.setItem('userRole', JSON.stringify(this.userRole));
      })
    })
  }
}
