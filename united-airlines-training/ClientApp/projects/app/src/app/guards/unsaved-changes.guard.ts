/*
  Author: Chris Nosowsky
*/
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface ComponentCanDeactivate {
  canDeactivate: () => boolean | Observable<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<ComponentCanDeactivate> {

  constructor() { }

/**
* Before leaving page, if there are unsaved changes, then setup a confirm alert message to let user know
*/
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    return component.canDeactivate() ? true : confirm('You have unsaved changes! Do you want to proceed?');
  }
}
