import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelSubviewComponent } from './channel-subview.component';

describe('ChannelSubviewComponent', () => {
  let component: ChannelSubviewComponent;
  let fixture: ComponentFixture<ChannelSubviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChannelSubviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelSubviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
