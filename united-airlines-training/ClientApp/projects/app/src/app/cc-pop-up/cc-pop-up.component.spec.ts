import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CcPopUpComponent } from './cc-pop-up.component';

describe('CcPopUpComponent', () => {
  let component: CcPopUpComponent;
  let fixture: ComponentFixture<CcPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CcPopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CcPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
