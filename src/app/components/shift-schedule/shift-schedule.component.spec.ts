import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShiftScheduleComponent } from "./shift-schedule.component";

describe("ShiftScheduleComponent", () => {
  let component: ShiftScheduleComponent;
  let fixture: ComponentFixture<ShiftScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
