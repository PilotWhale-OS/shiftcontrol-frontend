import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ManagePositionComponent } from "./manage-position.component";

describe("ManageShiftComponent", () => {
  let component: ManagePositionComponent;
  let fixture: ComponentFixture<ManagePositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
