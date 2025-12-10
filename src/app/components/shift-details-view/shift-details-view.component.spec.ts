import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ShiftDetailsViewComponent } from "./shift-details-view.component";

describe("ShiftDetailsViewComponent", () => {
  let component: ShiftDetailsViewComponent;
  let fixture: ComponentFixture<ShiftDetailsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftDetailsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftDetailsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
