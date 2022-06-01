/*
  Author: Chris Nosowsky
*/
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(public router: Router) { }

/**
* Before activating page, check if the user role meets the router minimum role level to authorize user
*/
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const minRoleLevel = route.data.minimumRole;  // please see the router.ts file to find this role level

    // grabs user role that was stored in the local storage on the app.component.ts file
    const userLevel = JSON.parse(localStorage.getItem("userRole"))  
    if (userLevel >= minRoleLevel)
      return true
    this.router.navigate(['unauthorized'])  // unauthorized router for the unauthorized component
    return false
  }
  
}
