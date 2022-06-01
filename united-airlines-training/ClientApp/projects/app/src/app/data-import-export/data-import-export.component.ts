import { Component, ElementRef, OnInit, Renderer2, ViewChild, NgModule} from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { DataImportExportService } from './data-import-export.service';
import { MediaService } from '../services/media.service';
import { MediaTypeService } from '../services/media-type.service';
import { Media } from '../models/media';
import { MediaType } from '../models/media-type';
import { Keyword } from '../models/keyword';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-data-import-export',
  templateUrl: './data-import-export.component.html',
  styleUrls: ['./data-import-export.component.css']
})
export class DataImportExportComponent implements OnInit {


  selectedFiles: FileList;
  progressInfos = [];
  filesExMessage = '';
  filesImMessage = '';
  csvExMessage = '';
  csvImMessage = '';
  importFolderPath = '';
  exportFolderPath = '';
  lockPath = false;
  selectedCSV: File;
  spinnerHidden = true;
  fileInfos: Observable<any>;

  constructor(private render2: Renderer2, private http: HttpClient, private dataImportExportService: DataImportExportService) {
  }

  ngOnInit(): void {
    this.fileInfos = this.dataImportExportService.getFiles();
  }

  exportMedia(): void {
    this.lockPath = true;
    var path = this.exportFolderPath;
    this.filesExMessage = 'Exporting Media.....';
    path = "\\" + path;
    path = path + "\\";

    var re1 = /\/+/ig;
    path = path.replace(re1, "\\");

    var re2 = /\\+/ig;
    path = path.replace(re2, "\\");
    var formData = new FormData();
    formData.append("path", path);
    //'api/MediaLibrary/Export/'+path
    this.http.post('api/MediaLibrary/Export/MediaFiles', formData, {
      responseType: "blob",
    }).subscribe(resp => {
      this.downloadFile(resp, "ExportedMedia.zip", "application/zip");
      this.filesExMessage = '';
    })
    this.lockPath = false;
  }

  exportData(): void {
    this.csvExMessage = 'Exporting.....';
    this.http.post('api/MediaLibrary/Export/MediaData/CSV', null, {
      responseType: "blob",
    }).subscribe(resp => {
      this.downloadFile(resp, "ExportedData.csv", "application/csv");
      this.csvExMessage = 'Files Exported.';
    })
  }

  downloadFile(data, fileName, contentType) {
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  selectFiles(event) {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
    this.filesImMessage = this.selectedFiles.length + " files selected.";
  }

  upload(idx, file, path : string){
    this.filesImMessage = 'Uploading Media....';
    this.progressInfos[idx] = { value: 0, fileName: file.name };

    this.dataImportExportService.upload(file.name, file, path).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfos[idx].value = Math.round(100 * event.loaded / event.total);
        } else if (event instanceof HttpResponse) {
          this.fileInfos = this.dataImportExportService.getFiles();
        }
      },
      err => {
        this.progressInfos[idx].value = 0;
        this.filesImMessage = 'Could not upload the file:' + file.name;
        return false;
      });
    return true;
  }

  importMedia() {
    this.lockPath = true;
    var path = this.importFolderPath;
    path = "\\" + path;
    path = path + "\\";


    var re1 = /\/+/ig;
    path = path.replace(re1, "\\");


    var re2 = /\\+/ig;
    path = path.replace(re2, "\\");

    this.filesImMessage = 'Upload ' + this.selectedFiles.length + " files to " + path + '....';

    for (let i = 0; i < this.selectedFiles.length; i++) {
      if (!this.upload(i, this.selectedFiles[i], path)) {
        this.filesImMessage = 'Can\'t upload ' + this.selectedFiles[i].name + ' .';
        return;
      }
    }
    this.lockPath = false;
    this.filesImMessage = 'Files Uploaded.';
  }
  openCSV(event): void {
    this.selectedCSV = event.target.files[0];
  }
  importData(): void {
    this.spinnerHidden = false;
    this.csvImMessage = 'Importing Data.....';
    var formData = new FormData();

    formData.append("file", this.selectedCSV);

    //'api/MediaLibrary/Export/'+path
    this.http.post('api/MediaLibrary/Import/MediaData/CSV', formData, {
      responseType: "json",
    }).subscribe(resp => {
      this.spinnerHidden = true;
      this.csvImMessage = 'Data Imported~';
    }, error => {
        this.spinnerHidden = true;
        this.csvImMessage = 'Data Import Failed....';
    });
    this.spinnerHidden = true;
  }

  exportAnalytic() : void{
  alert("haha!");
  }
}
