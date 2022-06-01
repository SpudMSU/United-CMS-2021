import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppRoutingModule } from './route';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    AppRoutingModule
  ],
  exports: [RouterModule]
})
export class AppModule { }
