import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistanceLearningSessionViewComponent } from './distance-learning-session-view.component';

describe('DistanceLearningSessionViewComponent', () => {
  let component: DistanceLearningSessionViewComponent;
  let fixture: ComponentFixture<DistanceLearningSessionViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DistanceLearningSessionViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DistanceLearningSessionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
