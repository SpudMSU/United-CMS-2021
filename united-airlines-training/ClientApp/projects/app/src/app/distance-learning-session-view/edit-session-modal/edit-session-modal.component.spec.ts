import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSessionModalComponent } from './edit-session-modal.component';

describe('EditSessionModalComponent', () => {
  let component: EditSessionModalComponent;
  let fixture: ComponentFixture<EditSessionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditSessionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSessionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
