import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistanceLearningContentComponent } from './distance-learning-content.component';

describe('DistanceLearningContentComponent', () => {
  let component: DistanceLearningContentComponent;
  let fixture: ComponentFixture<DistanceLearningContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistanceLearningContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistanceLearningContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
