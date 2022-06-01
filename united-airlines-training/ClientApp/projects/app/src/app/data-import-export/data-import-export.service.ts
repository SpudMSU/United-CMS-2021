import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataImportExportService {

  constructor(private http: HttpClient) { }

  upload(filename : string, file: File, path: string): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.set("enctype","multipart/form-data");
    formData.append(filename, file);
    formData.append("path", path);

    const req = new HttpRequest('POST', `api/MediaLibrary/Import/MediaFiles`, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get(`api/MediaLibrary/Import`);
  }
}
