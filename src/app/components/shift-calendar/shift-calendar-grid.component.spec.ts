import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftCalendarGridComponent } from './shift-calendar-grid.component';

describe('ShiftCalendarComponent', () => {
  let component: ShiftCalendarGridComponent;
  let fixture: ComponentFixture<ShiftCalendarGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftCalendarGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftCalendarGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
