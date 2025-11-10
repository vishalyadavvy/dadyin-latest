import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayinUsersComponent } from './dayin-users.component';

describe('DayinUsersComponent', () => {
  let component: DayinUsersComponent;
  let fixture: ComponentFixture<DayinUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DayinUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DayinUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
