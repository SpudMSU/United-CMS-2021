import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ContactModalComponent } from '../contact-modal/contact-modal.component';
import { AppSettingsService } from '../services/appsettings.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css']
})
export class HelpComponent implements OnInit {

  phone: string = ""
  email: string = ""
  faq: string = ""

  constructor(private matDialog: MatDialog, private _appSettingsService: AppSettingsService) { }

  ngOnInit(): void {
    this._appSettingsService.getHelpContent().subscribe(data => {
      this.phone = data["phone"]
      this.email = data["email"]
      this.faq = data["faq"]
    })
  }


  openContactModal() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.matDialog.open(ContactModalComponent, dialogConfig);
  }

}
