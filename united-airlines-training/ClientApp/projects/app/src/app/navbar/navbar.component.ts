import { Component, OnInit, Input } from '@angular/core';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { AppSettingsService } from '../services/appsettings.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  @Input() roleCodeLevel: number = 0;
  userId: string = "";
  curUser: User;
  helpPageEnabled: boolean
  aboutusPageEnabled

  constructor(private _userService: UserService, private _appSettingsService: AppSettingsService) { }

  async ngOnInit() {
    //Get the role level of the current user
    this.roleCodeLevel = JSON.parse(localStorage.getItem("userRole"))

    /*
     * These function calls get info from appsettings.json as to whether or
     * not the 'About us' page and the 'Help' page should be displayed
     */
    this._appSettingsService.getAboutContent().subscribe(res => {
      this.aboutusPageEnabled = res["enabled"]
    })

    this._appSettingsService.getHelpContent().subscribe(res => {
      this.helpPageEnabled = res["enabled"]
    })
  }
}
