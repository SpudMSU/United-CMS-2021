/*
  Author: Chris Nosowsky
 */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { User } from '../models/user';
import { Media } from '../models/media';
import { UserService } from '../services/user.service';
import { MediaService } from '../services/media.service';
import { MediaTypeService } from '../services/media-type.service';
import { UserHistory } from '../models/user-history';
import { AnalyticService } from '../services/analytic.service';
import { RatingService } from '../services/rating.service';
import { Rating } from '../models/rating';
import { environment } from '../../environments/environment';
import { CommentService } from '../services/comment.service';
import { forkJoin } from 'rxjs';
import { MediaType } from '../models/media-type';
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DepCostLoc } from '../models/depCostLoc'
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { resolve } from 'dns';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';


export interface GroupInfoType {
  clickedAmount: number,
  costCenterDesc: string,
  department: string,
  firstName: string,
  jobRoleCode: string,
  lastName: string,
  like: string,
  locationCode: string,
  mediaId: number,
  mediaTypeID: number,
  title: string,
  uid: string,
  updatedAt: Date,
}

@Component({
  selector: 'app-analytic-report-page',
  templateUrl: './analytic-report-page.component.html',
  styleUrls: ['./analytic-report-page.component.css']
})

export class AnalyticReportPageComponent implements OnInit {
  sortedData = []

  reportInfo = "Report Generating..."
  reportTitle = "Analytics Report"
  showFilter = true
  locationControl = new FormControl();
  costControl = new FormControl();
  departmentControl = new FormControl();

  locations: string[] = ['One', 'Two', 'Three', 'Four'];
  costCenter: string[] = ['Apple', 'Banana', 'Cream', 'Dragon'];
  departments: string[] = ['Metallica', 'Queen', 'AC/DC'];
  ratings = []
  groupInfos = []

  locationFilter = '';
  costFilter = '';
  departmentFilter = '';

  locationOptions: Observable<string[]>;
  costOptions: Observable<string[]>;
  departmentOptions: Observable<string[]>;

  exporting: boolean = false;
  reportType: string = ""
  reportID: string = ""
  reportFirstName: string = ""
  reportLastName: string = ""
  reportEmail: string = ""
  reportMediaTitle: string = ""


  type: string = ""
  user: User = {
    uid: "",
    firstName: "",
    lastName: "",
    createdAt: null,
    updatedAt: null,
  };
  mediaHistory: UserHistory[] = []
  mediaUsers: User[] = []
  mediaRatings: Rating[] = [];
  userRatings: string[] = [];
  media: Media = {
    thumbnailPath: "",
  };

  // pagination limits to 10 items returned per page
  perPageCount: number = 10

  // starting page number for pagination component
  p: number = 1;

  // starting page number for pagination component
  p2: number = 1;

  indexForType: number = 0
  indexForP1: number = 0
  indexForP2: number = 0

  // Utilization for media item report
  utilization: number = 0;
  // Watch duration for media item report
  watchDuration: number = 0;
  // Like to dislike ratio for media item report
  ldRatio: number = 0
  // number of likes media item has
  likes: number = 0
  // number of dislikes media item has
  dislikes: number = 0

  // number of comments user has made
  commentCount: number = 0
  // number of ratings user has made
  ratingCount: number = 0

  queries: string[] = []
  columns: string[] = []

  // User analytics lists
  recommended: Media[] = [];
  recommendedTypes: MediaType[] = [];
  openOrPlayed: Media[] = [];
  openOrPlayedTypes: MediaType[] = [];
  dataSource: MatTableDataSource<GroupInfoType>;
  // determines if results got returned or not
  noResults: boolean = true;

  SitePath: string = environment.SitePath;

  /**
   * Constructor initializes all services used
   */
  constructor(private route: ActivatedRoute,
    private _userService: UserService,
    private _mediaService: MediaService,
    private _mediaTypeService: MediaTypeService,
    private _analyticService: AnalyticService,
    private _ratingService: RatingService,
    private _commentService: CommentService,
    private http: HttpClient
  ) { }

  /**
   * Component initialize function
   */
  ngOnInit() {
    this.ratings = []
    if (this.SitePath.slice(-1) == '/') // This is needed for the exchange between client and development environment
      this.SitePath = this.SitePath.slice(0, -1)

    // listens for router/url changes
    this.route.params.subscribe(params => {
      // decodes the URL to grab the type of report (is it a user report? media report?)
      this.reportType = decodeURIComponent(params.reportType);
      // user alt just means it's the second form option (after the OR on the report lookup page)
      if (this.reportType == "userAlt") {
        this.reportFirstName = decodeURIComponent(params.userFirst)
        this.reportLastName = decodeURIComponent(params.userLast)
        this.reportEmail = decodeURIComponent(params.userEmail)
      } else if (this.reportType == "mediaAlt") {
        this.reportMediaTitle = decodeURIComponent(params.reportID)
      } else {
        this.reportID = decodeURIComponent(params.reportID);
      }
      this.startingFunctions()
    });

    this._userService.getDepartmentCostLocation().subscribe(res => {
      this.locations = res.Location
      this.costCenter = res.CostCenter
      this.departments = res.Department

      this.locationOptions = this.locationControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.locations))
        );

      this.costOptions = this.costControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.costCenter))
        );
      this.departmentOptions = this.departmentControl.valueChanges
        .pipe(
          startWith(''),
          map(value => this._filter(value, this.departments))
        );
    })
    this.locationOptions = this.locationControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.locations))
      );

    this.costOptions = this.costControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.costCenter))
      );
    this.departmentOptions = this.departmentControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value, this.departments))
      );

  }
  private _filter(value: string, optionlist: string[]): string[] {
    const filterValue = value.toLowerCase();
    return optionlist.filter(option => option.toLowerCase().includes(filterValue));
  }
  /**
   * Starting functions are ran when a new report is made
   */
  startingFunctions() {
    // reset all defined global variables if needed
    this.indexForType = 0
    this.indexForP1 = 0
    this.indexForP2 = 0
    this.p = 1;
    this.p2 = 1;
    this.mediaHistory = []
    this.mediaUsers = []
    this.recommended = []
    this.recommendedTypes = []
    this.openOrPlayed = []
    this.openOrPlayedTypes = []
    this.userRatings = []
    this.mediaRatings = []
    this.ratings = []

    if (this.reportType == "user") {  // user looked up user report by UID
      this.showFilter = false
      this.reportTitle = "User Analytics Report"
      this._userService.getUser(this.reportID).subscribe(res => {
        if (res != null) {
          this.user = res
          this.noResults = false;
          this.gatherUserAnalytics()
        }
      })

    } else if (this.reportType == "userAlt") {  // user looked up user report by knowing first name, last name, email
      this.showFilter = false
      this.reportTitle = "User Analytics Report"
      if (this.reportFirstName != "null") {
        this.queries.push(this.reportFirstName)
        this.columns.push("FirstName")
      } else if (this.reportLastName != "null") {
        this.queries.push(this.reportLastName)
        this.columns.push("LastName")
      } else if (this.reportEmail != "null") {
        this.queries.push(this.reportEmail)
        this.columns.push("Email")
      }
      this._userService.searchForUsers(this.queries, this.columns).subscribe(data => {
        if (data[0]) {
          this.user = data[0]
          this.noResults = false;
          this.gatherUserAnalytics()
        }
      })
    } else if (this.reportType == "media") {  // user looked up media report by media ID
      this.reportTitle = "Media Analytics Report"
      this.gatherMediaPageUserAnalytics()
      //this.getMediaType(this.media.mediaTypeID)
    } else if (this.reportType == 'mediaAlt') { // user looked up report by media title
      this.reportTitle = "Media Analytics Report"
      this.gatherMediaPageUserAnalytics();
    } else if (this.reportType == 'group') {
      this.reportTitle = "Group Analytics Report"
      this.gatherGroupAnalytics();
    }
  }

  async gatherGroupAnalytics() {
    await new Promise((resolve, reject) => {
      var formData = new FormData();
      if (this.departmentFilter) {
        formData.append("dep", this.departmentFilter)
      }
      if (this.costFilter) {
        formData.append("cost", this.costFilter)
      }
      if (this.locationFilter) {
        formData.append("loc", this.locationFilter)
      }
      formData.append("MediaId", this.reportID);
      this.http.post('api/Analytic/Group/', formData, {
        responseType: "json",
      }).subscribe(resp => {
        if (resp != null) {
          this.noResults = false;
          this.groupInfos = resp["info"];
          this.sortedData = this.groupInfos;
        }

        resolve();

      }, error => {
        this.noResults = true;
        this.reportInfo = 'Media Item Not Exists...'

        resolve();
      },
        /*() => {
          this.noResults = true;
          this.reportInfo = 'Media Item Not Exists...'
         
          resolve();
        }*/
      )
    });
  }

  async getMediaType(id: number) {
    await new Promise((resolve, reject) => {
      this._mediaTypeService.getMediaType(id).subscribe(data => {
        this.type = data.name;
      })
    });
  }

  /**
   * Get user analytics. FOR THE USER REPORT SIDE!!
   */
  async gatherUserAnalytics() {
    await new Promise((resolve, reject) => {
      this._analyticService.getRecommendedMedia(this.user["uid"]).subscribe(data => {
        var recommended2 = data
        this.recommended = recommended2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        const obs = this.recommended.map(t => this._mediaTypeService.getMediaType(t.mediaTypeID))
        forkJoin(obs).subscribe(data => {
          this.recommendedTypes = data
        })
      })

      this._analyticService.getOpenedOrPlayedMedia(this.user["uid"]).subscribe(data => {
        var openOrPlayed2 = data
        this.openOrPlayed = openOrPlayed2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        this.sortedData = this.openOrPlayed
        const obs = this.openOrPlayed.map(t => this._mediaTypeService.getMediaType(t.mediaTypeID))
        forkJoin(obs).subscribe(data => {
          this.openOrPlayedTypes = data
        })
      })

      this._commentService.getAllUserComments(this.user["uid"]).subscribe(data => {
        this.commentCount = data.length
      })

      this._ratingService.getAllUserRatings(this.user["uid"]).subscribe(data => {
        this.ratingCount = data.length
      })
    });
  }


  /**
   * Get media page analytics. FOR THE MEDIA REPORT SIDE!!
   */
  async gatherMediaPageUserAnalytics() {
    await new Promise((resolve, reject) => {
      var formData = new FormData();
      if (this.departmentFilter) {
        formData.append("dep", this.departmentFilter)
      }
      if (this.costFilter) {
        formData.append("cost", this.costFilter)
      }
      if (this.locationFilter) {
        formData.append("loc", this.locationFilter)
      }
      formData.append("MediaId", this.reportID);
      this.http.post('api/Analytic/Media/', formData, {
        responseType: "json",
      }).subscribe(resp => {
        if (resp != null) {
          this.noResults = false;
          this.ratings = resp["ratings"];
          this.media = resp["media"]
          this.likes = resp["likes"]
          this.dislikes = resp["dislikes"]
          this.utilization = resp["utilization"]
          this.watchDuration = resp["watchDuration"]
          this.ldRatio = resp["ldRatio"]
          this.getMediaType(this.media.mediaTypeID)
          this.sortedData = this.ratings;
        }

        resolve();

      }, error => {
        this.noResults = true;
        this.reportInfo = 'Media Item Not Exists...'

        resolve();
      },
        /*() => {
          this.noResults = true;
          this.reportInfo = 'Media Item Not Exists...'
         
          resolve();
        }*/
      )
    });
  }

  /**
   * Converts the back end UTC date to a local date (local time)
   */
  convertUTCDateToLocalDate(dateStr) {
    var date = new Date(dateStr)
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate.toDateString();
  }

  /**
   * Update index to accomodate for pagination.
   */
  updateIndex(p: number) {
    this.indexForType = this.perPageCount * (p - 1)
  }

  filtMedia(): void {
    this.indexForType = 0
    this.indexForP1 = 0
    this.indexForP2 = 0
    this.p = 1;
    this.p2 = 1;
    this.mediaHistory = []
    this.mediaUsers = []
    this.recommended = []
    this.recommendedTypes = []
    this.openOrPlayed = []
    this.openOrPlayedTypes = []
    this.userRatings = []
    this.mediaRatings = []
    this.likes = 0
    this.dislikes = 0
    this.utilization = 0
    if (this.reportType == 'media')
      this.gatherMediaPageUserAnalytics();
    else if (this.reportType == 'group')
      this.gatherGroupAnalytics();
  }

  /**
   * Update index to accomodate for pagination.
   */
  updateIndexP1(p: number) {
    this.indexForP1 = this.perPageCount * (p - 1)
  }

  /**
   * Update index to accomodate for pagination.
   */
  updateIndexP2(p: number) {
    this.indexForP2 = this.perPageCount * (p - 1)
  }

  /**
   * Encode the URL
   */
  encodeVal(val: string): string {
    return encodeURI(val)
  }

  userCSV():void {
    let fileName = 'Report for' + this.user.firstName + ' ' + this.user.lastName + '.pdf';

    let columnNames = ['MediaID', 'Title', 'Media Type', 'Media Upload Date']
    let header = columnNames.join(',');
    let csv = header;
    csv += '\r\n';

    this.openOrPlayed.map(d=>{
      csv += ([d["mediaID"], d["title"], getMediaTypeById(d["mediaTypeID"]), fixDate(d["createdAt"].toDateString())]).join(',');
      csv += '\r\n'
    })
    this.downloadCSV(csv, fileName)
  }

  mediaCSV(): void {
    let fileName = 'report for ' +  this.media.title +'.csv';
    let columnNames = ["United ID", "First Name", "Last Name", "Email",
      "Job Code", "Department", "Location", "Rating", "Watch Length", "Views", "Last Viewed"];
    let header = columnNames.join(',');
    let csv = header;
    csv += '\r\n';

    this.ratings.map(c => {
      csv += [c["uid"], c["firstName"], c["lastName"], c["email"], c["jobRoleCode"],
      c["department"], c["location"], c["like"], (c["watchLength"] * 100).toFixed(2) + "%", c["clickedAmount"], c["updatedAt"]].join(',');
      csv += '\r\n';
    })

    this.downloadCSV(csv, fileName)
  }

  groupCSV(): void {
    let fileName = 'Group Report.csv';
    let columnNames = ["United ID", 'First Name', 'Last Name', 'Job Code',
    'Department', 'Location', 'Cost Center', 'Rating', 'View', 'Last Viewed'
    , 'Media ID', 'Media Title', 'Media Type']
    let header = columnNames.join(',');
    let csv = header;
    csv += '\r\n';
    this.groupInfos.map(d=>
      {
        csv += [d["uid"], d["firstName"], d["lastName"], d["jobRoleCode"], d["department"],
      d["locationCode"], d["costCenter"], d["like"] == 1 ? 1 : 0, d["clickedAmount"], fixDate(d["updatedAt"]),
      d["mediaId"], d["title"], getMediaTypeById(d["mediaTypeID"])].join(',');
        csv += '\r\n'
    })

    this.downloadCSV(csv, fileName)
  }

  exportCSV(): void {
    if(this.noResults)
      return
    if (this.reportType == 'user') {
      this.userCSV();
    }
    else if (this.reportType == "media" || this.reportType == 'mediaAlt') {
      this.mediaCSV();
    } else if (this.reportType == 'group') {
      this.groupCSV();
    }

  }

  downloadCSV(csv, fileName): void {
    var blob = new Blob([csv], { type: "text/csv;" });

    var link = document.createElement("a");
    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  groupPDF(): void {
    let pdfHeader = [["UID", 'First\nName', 'Last\nName', 'Job\nCode',
      'Dpt', 'Loc', 'Cost\nCenter', 'Rate', 'View', 'Last\nViewed'
      , 'MID', 'Title','Media\nType']]
    let pdfData = []
    this.groupInfos.map(d => {
      pdfData.push([d["uid"], d["firstName"], d["lastName"], d["jobRoleCode"], d["department"],
      d["locationCode"], d["costCenter"], d["like"] == 1 ? 1 : 0, d["clickedAmount"], fixDate(d["updatedAt"]),
      d["mediaId"], d["title"], getMediaTypeById(d["mediaTypeID"])])
    }
    );
    let pdfTitle = 'Group Report.pdf';
    this.downloadPDF(pdfHeader, pdfData, pdfTitle);
  }

  userPDF(): void {
    let pdfHeader = [['MediaID', 'Title', 'Media Type', 'Media Upload Date']]
    let pdfData = []

    this.openOrPlayed.map(d=>{
      pdfData.push([d["mediaID"], d["title"], getMediaTypeById(d["mediaTypeID"]), fixDate(d["createdAt"].toDateString())])
    })

    let pdfTitle = 'Report for' + this.user.firstName + ' ' + this.user.lastName + '.pdf';
    this.downloadPDF(pdfHeader, pdfData, pdfTitle);
  }

  mediaPDF():void {
    let pdfHeader = [["UID", 'First\nName', 'Last\nName','Email', 'Job\nCode',
    'Dpt', 'Loc', 'Rate', 'Views', 'Last\nViewed']]
    
    let pdfData = []
    this.ratings.map(d => {
      pdfData.push([d["uid"], d["firstName"], d["lastName"],d["email"], d["jobRoleCode"], d["department"],
      d["locationCode"], d["like"] == 1 ? 1 : 0, d["clickedAmount"], fixDate(d["updatedAt"]),
    ])
    }
    );
    let pdfTitle = 'Report for' + this.reportTitle + '.pdf'
    
    this.downloadPDF(pdfHeader, pdfData, pdfTitle);
  }

  exportPDF(): void {
    if(this.noResults)
      return
    if (this.reportType == 'user') {
      this.userPDF();
    }
    else if (this.reportType == "media" || this.reportType == 'mediaAlt') {
      this.mediaPDF();
    } else if (this.reportType == 'group') {
      this.groupPDF();
    }
  }
  downloadPDF(pdfHeader, pdfData, pdfTitle): void {
    var doc = new jsPDF();
    autoTable(doc, {
      head: pdfHeader,
      body: pdfData,
      theme: 'grid',
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
      },
      margin: 0,
      startY: 0
    });
    doc.save(pdfTitle)
  }
  sortData(sort: Sort, aimData) {
    const data = aimData.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'uid': return compare(a.uid, b.uid, isAsc);
        case 'fName': return compare(a.firstName, b.firstName, isAsc);
        case 'lName': return compare(a.lastName, b.lastName, isAsc);
        case 'jobCode': return compare(a.jobRoleCode, b.jobRoleCode, isAsc);
        case 'department': return compare(a.department, b.department, isAsc);
        case 'location': return compare(a.location, b.location, isAsc);
        case 'costCenter': return compare(a.costCenterDesc, b.costCenterDesc, isAsc);
        case 'rating': return compare(a.like, b.like, isAsc);
        case 'views': return compare(a.clickedAmount, b.clickedAmount, isAsc);
        case 'lastViewed': return compare(a.updatedAt, b.updatedAt, isAsc);
        case 'mediaID': return compare(a.mediaID, b.mediaID, isAsc);
        case 'mediaTitle': return compare(a.mediaTitle, b.mediaTitle, isAsc);
        case 'mediaType': return compare(a.mediaTypeID, b.mediaTypeID, isAsc);
        case 'createdAt': return compare(a.createdAt, b.createdAt, isAsc);
        case 'watchLength': return compare(a.watchDuration, b.watchDuration, isAsc);
        case 'email': return compare(a.email, b.email, isAsc);
        default: return 0;
      }
    });
  }
  sortGroup(sort: Sort) {
    this.sortData(sort, this.groupInfos)
  }
  sortUser(sort: Sort) {
    this.sortData(sort, this.openOrPlayed)
  }
  sortMedia(sort: Sort) {
    this.sortData(sort, this.ratings)
  }

}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function getMediaTypeById(id) {
  if (!id)
    return ""
  switch (id) {
    case 1:
      return "PDF"
    case 2:
      return "MP4"
    case 3:
      return "HTML"
    case 4:
      return "Course\nTraining\nManual"
    case 5:
      return "TechTalk"
    case 6:
      return "External\nLink"
  }
}

function fixDate(date: string) {
  if (date === 'UNKNOW')
    return date
  let tempDate = new Date(date)
  let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return tempDate.toLocaleDateString('en-US', options);
}