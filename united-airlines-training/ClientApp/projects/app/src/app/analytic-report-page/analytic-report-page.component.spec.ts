import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticReportPageComponent } from './analytic-report-page.component';

describe('AnalyticReportPageComponent', () => {
  let component: AnalyticReportPageComponent;
  let fixture: ComponentFixture<AnalyticReportPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalyticReportPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
