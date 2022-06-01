import { Component, OnInit } from '@angular/core';
import { AppSettingsService } from '../services/appsettings.service';

@Component({
  selector: 'app-aboutus',
  templateUrl: './aboutus.component.html',
  styleUrls: ['./aboutus.component.css']
})
export class AboutusComponent implements OnInit {
  description: string = ""

  constructor(private _appSettingsService: AppSettingsService) { }

  ngOnInit(): void {
    this._appSettingsService.getAboutContent().subscribe(data => {
      this.description = data["description"]
    })
  }

}
