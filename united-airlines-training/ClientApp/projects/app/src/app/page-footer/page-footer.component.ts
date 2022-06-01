import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-footer',
  templateUrl: './page-footer.component.html',
  styleUrls: ['./page-footer.component.css']
})
export class PageFooterComponent implements OnInit {

  content = "Tech Ops Training Content Management System";

  constructor() { }

  ngOnInit(): void {
  }

}
