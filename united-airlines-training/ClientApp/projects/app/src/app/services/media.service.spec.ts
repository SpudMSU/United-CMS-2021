import { TestBed } from '@angular/core/testing';
import { MediaService } from './media.service';
import { Media } from '../models/media';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpResponse } from '@angular/common/http';

// AUthor: Shawn Pryde
//
// This is not going to work.
//
// Testing suite for the Media service 
describe('MediaService', () => {
  let service: MediaService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [HttpClientTestingModule],
      // Establish providers
      providers: [MediaService]
    });
    // TODO: spy on other methods too
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(MediaService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  // default test in angular
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // test to get an item
  //it('should get an item', done => {
  //  const expectedMedia: Media = {
  //    title: "filler",
  //    mediaID: 1,
  //    description: "more filler",
  //    thumbnailPath: "some path",
  //    flagged: false,
  //    createdAt: "9/29/2020 12:00:00 AM",
  //    size: 1,
  //    path: "some path"
  //  };

  //  //httpClientSpy.get.and.returnValue(expectedMedia);

  //  // test the get
  //  service.getMedia(expectedMedia.mediaID).subscribe(
  //    media => {
  //      console.log(media)
  //      expect(media).toEqual(expectedMedia, 'expected media returned'), fail;
  //      done();
  //    }
  //  );

    //expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
  // });
});
