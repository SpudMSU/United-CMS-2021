import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditchildtitlePopUpComponent } from './editchildtitle-pop-up.component';

describe('EditchildtitlePopUpComponent', () => {
  let component: EditchildtitlePopUpComponent;
  let fixture: ComponentFixture<EditchildtitlePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditchildtitlePopUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditchildtitlePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
