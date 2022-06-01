import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css']
})
export class PageHeaderComponent implements OnInit {

  @Input() role: number = 0;

  searchType: string = "media";
  searchText: string = '';
  SitePath: string = environment.SitePath;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (this.SitePath.slice(-1) == '/')
      this.SitePath = this.SitePath.slice(0, -1)
  }

  search(): void {
    /*
     * Called when the user searches for something
     */
    if (this.searchText != '') {
      this.router.navigate(["/search/" + this.searchType + "/" + this.encodeSearchTerm()]);
    }
  }

  encodeSearchTerm(): string {
    /*
     * This takes the text the user has searched for and encodes
     * it so that it can be placed in the URL
     */
    return encodeURIComponent(this.searchText);
  }

  setSearchType(type: any) {
    /*
     * This was used for a dropdown to select whether you wanted to search for
     * media or for channels. That dropdown is currently no longer in the header
     */
    this.searchType = type.target.value;
  }
}
