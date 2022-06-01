/*
  Author: Chris Nosowsky
  Contributor: Spencer Cassetta
*/
import { Component, OnInit, HostListener } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { UserSaveModalComponent } from '../user-save-modal/user-save-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ComponentCanDeactivate } from '../guards/unsaved-changes.guard';
import { Observable } from 'rxjs';
import { AdminAuditLog } from '../models/admin-audit-log';
import { AdminAuditLogService } from '../services/admin-audit-log.service';
import { ChangedUserService } from '../services/changed-user.service';
import { ChangedUser } from '../models/changed-user';

@Component({
  selector: 'app-user-admin-page',
  templateUrl: './user-admin-page.component.html',
  styleUrls: ['./user-admin-page.component.css']
})
export class UserAdminPageComponent implements OnInit, ComponentCanDeactivate {

  SitePath: string = environment.SitePath;

  // pagination limits to 10 items returned per page
  perPageCount: number = 10

  // starting page number for pagination component
  p: number = 1;

  indexForPage: number = 0;
  currentUser : User
  // Default dropdown selected for what to search by
  selected: string = "United ID"  
  userSearchInput: string = ""

  // Default input in dropdown when employment type is selected in search by
  employmentInput: string = "A"

  // Default input in dropdown when role level is selected in search by
  roleInput: string = "Guest" 

  currentRole: string[] = []
  currentStatus: string[] = []
  currentEmails: string[] = []
  originalEmails: string[] = []

  returnedUsers: User[] = []

  noResults = false
  noSearchInput = false

  // boolean list of the size of the # of returned rows in search result
  // If true at an index, it means that row has been changed and needs to be saved
  saveChangesButton: boolean[] = [] 

  // Every option to search by
  selectOptions = [
    { id: 0, name: "United ID", column: "UID" },
    { id: 1, name: "Employment Status", column: "EmploymentStatus" },
    { id: 2, name: "First Name", column: "FirstName" },
    { id: 3, name: "Last Name", column: "LastName" },
    { id: 4, name: "Email", column: "Email" },
    { id: 5, name: "Role Level", column: "RoleCode" },
    { id: 6, name: "Department", column: "Department" },
    { id: 7, name: "Location", column: "LocationCode" }
  ];

  // All role levels for dropdown when assigning roles to users
  roleOptions = [
    { id: 0, name: "Guest", roleCode: 1 },
    { id: 1, name: "Moderator", roleCode: 2 },
    { id: 2, name: "Contributor", roleCode: 3 },
    { id: 3, name: "Administrator", roleCode: 4 },
  ];

  // This will be set after getting all distinct employment statuses from database
  statusOptions = [];

/**
 * Constructor initializes all services used in component
 */
  constructor(
    private _userService: UserService,
    private _adminAuditService: AdminAuditLogService,
    private _changedUserService: ChangedUserService,
    private _matDialog: MatDialog
  ) { }

/**
 * Component initialize function
 */
  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)

    // fills array on number of items returned on page
    this.saveChangesButton = new Array(this.perPageCount);
    // fills all with false since the page has unsaved changes
    this.saveChangesButton.fill(false)  

    this._userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    })
    // This is solely assuming the statuses are in the table currently.
    this._userService.getDistinctEmploymentStatus().subscribe(data => {
      let id = 0;
      for (let status of data)
        this.statusOptions.push({ id, name: status })
      this.statusOptions = this.statusOptions.sort((a, b) => {
          return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
      })
    })
  }

  clearOtherInputs() {
    if (this.selected == 'Role Level') {
      this.userSearchInput = ""
      this.employmentInput = "A"
    }
    else if (this.selected == 'Employment Status') {
      this.userSearchInput = ""
      this.roleInput = "Guest"
    }
    else {
      this.roleInput = "Guest"
      this.employmentInput = 'A'
    }
  }

/**
 * Before leaving page, determine if there are unsaved changes.
 * This connects with the unsaved-changes.guard file
 */
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    if (this.saveChangesButton.indexOf(true) !== -1)
      return false
    return true
  }

/**
 * Pushes new content to each list determines by rows returned
 */
  determineEditableValues() {
    for (let u of this.returnedUsers) {
      if (u.roleCode == 1)
        this.currentRole.push("Guest")
      else if (u.roleCode == 2)
        this.currentRole.push("Moderator")
      else if (u.roleCode == 3)
        this.currentRole.push("Contributor")
      else if (u.roleCode == 4)
        this.currentRole.push("Administrator")

      this.currentStatus.push(u.employmentStatus)
      this.currentEmails.push(u.email)
      this.originalEmails.push(u.email)
    }
  }

/**
  * Before saving changes, it makes sure the user is sure that they want to save
  oh really?*/

  async logChanges(title: string, change: string, mediaID: number, c_user: User) {
    let user = this.currentUser
    let userName = user.firstName.concat(" ").concat(user.lastName)
    let roles = ["Guest", "Contributer", "Moderator", "Administrator"];
    let role = roles[user.roleCode - 1];
    let currentdate = new Date()
    const entry: AdminAuditLog =
    {
      id: 0,
      category: "User",
      item: title,
      change: change,
      username: userName,
      userRole: role,
      changeDate: currentdate,
      mediaID: mediaID
    }
    console.log(entry)
    await new Promise((resolve, reject) => {
      this._adminAuditService.createEntry(entry).subscribe(x => {
        const changedUser: ChangedUser =
        {
          changeID: x.id,
          uId: c_user["uid"],
          firstName: c_user.firstName,
          lastName: c_user.lastName,
          email: c_user.email,
          employmentStatus: c_user.employmentStatus,
          company: c_user.company,
          roleCode: c_user.roleCode,
          jobRoleCode: c_user.jobRoleCode,
          jobGroup: c_user.jobGroup,
          occupationTitle: c_user.occupationTitle,
          department: c_user.department,
          locationCode: c_user.locationCode,
          costcenter: c_user.costcenter,
          costcenterdesc: c_user.costcenterdesc,
          createdAt: c_user.createdAt,
          updatedAt: c_user.updatedAt
        }
        console.log(changedUser)
        this._changedUserService.postChangedUser(changedUser).subscribe(x => {
          resolve()
        })
      })
    })
  }
  openConfirmModal(index: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { title: "Are you sure you want to save?" };
    const dialogRef = this._matDialog.open(UserSaveModalComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(closeData => {
      if (closeData) {
        this.MakeChanges(index)
      }
    });
  }

  async MakeChanges(index: number) {
    let user = Object.assign({}, this.returnedUsers[index]);
    var result = this.roleOptions.find(obj => {
      return obj.name == this.currentRole[index]
    })
    let title = user.firstName.concat(" ").concat(user.lastName)
    console.log(this.returnedUsers[index])
    let fullUid: string = this.returnedUsers[index]["uid"]
    let mediaID = parseInt(fullUid.substring(1))
    if (this.returnedUsers[index].roleCode != result["roleCode"]) {
      this.returnedUsers[index].roleCode = result["roleCode"]
      let change = "Updated User Rolecode"
      await this.logChanges(title, change, mediaID, user)
    }
    if (this.returnedUsers[index].employmentStatus != this.currentStatus[index]) {
      this.returnedUsers[index].employmentStatus = this.currentStatus[index]
      let change = "Updated User Employment Status"
      await this.logChanges(title, change, mediaID, user)
    }

    if (this.currentEmails[index] == "") {
      this.originalEmails[index] = this.currentEmails[index]
      this.returnedUsers[index].email = null  // Setting to null so it shows up as NULL in the database
      let change = "Deleted User Email"
      await this.logChanges(title, change, mediaID, user)
    }
    else {
      if (this.originalEmails[index] != this.currentEmails[index] || this.returnedUsers[index].email != this.currentEmails[index]) {
        let change = "Updated User Email"
        await this.logChanges(title, change, mediaID, user)
        this.originalEmails[index] = this.currentEmails[index]
        this.returnedUsers[index].email = this.currentEmails[index]
      }
    }

    this._userService.updateUser(this.returnedUsers[index]["uid"], this.returnedUsers[index]).subscribe(res => {
      console.log("Saved User.")
      this.saveChangesButton[index] = false;
    })
  }

/**
 * Turns on save changes button for that row if changes
 * have been made to any of the input fields
 */
  updateSelected(index: number) {
    this.saveChangesButton[index] = true
  }

/**
 * Updates index for page to accomodate for each pagination page change
 */
  updateIndexPage(p: number) {
    this.indexForPage = this.perPageCount * (p - 1)
  }

/**
 * Update the current email and turn save
 * button on/off if changes haven't been made since last save
 */
  updateEmail(val: string, index: number) {
    this.currentEmails[index] = val
    if (val == this.originalEmails[index])
      this.saveChangesButton[index] = false
    else if (val == "" && this.originalEmails[index] == null)
      this.saveChangesButton[index] = false
    else
      this.saveChangesButton[index] = true
  }

/**
 * Search for user after search button is clicked
 */
  searchUser() {
    var searchInput = this.userSearchInput
    // Check if role level or employment status is selected
    // They have different variables
    if (this.selected == 'Role Level')
      searchInput = this.roleInput
    if (this.selected == 'Employment Status')
      searchInput = this.employmentInput

    if (searchInput == "") {
      this.noSearchInput = true
    } else {

      // Reset values on new search
      this.noResults = false
      this.noSearchInput = false
      this.saveChangesButton.splice(0, this.saveChangesButton.length)
      this.currentRole.splice(0, this.currentRole.length)
      this.currentStatus.splice(0, this.currentStatus.length)
      this.currentEmails.splice(0, this.currentEmails.length)
      this.originalEmails.splice(0, this.originalEmails.length)

      var result = this.selectOptions.find(obj => {
        return obj.name == this.selected
      })
      this._userService.searchForUsers([searchInput], [result.column]).subscribe(res => {
        if (res[0]) {
          this.returnedUsers = res
          this.determineEditableValues()
        }
        else {
          this.noResults = true
          this.returnedUsers = []
        }
      })
    }
  }

}
