/*
  Author: Chris Nosowsky
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Pipe({ name: 'safe' }) // this is the name of a pipe
export class PipeComponent implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
/**
* PDFJS has some security issue on its URL. This sanitizer transforms the url to make it bypass the security check that angular does
*/
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
