import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DialogAddUnavailabilityComponent } from "./dialog-add-unavailability.component";

describe("DialogAddUnavailabilityComponent", () => {
  let component: DialogAddUnavailabilityComponent;
  let fixture: ComponentFixture<DialogAddUnavailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddUnavailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddUnavailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
