import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InputSliderComponent } from "./input-slider.component";

describe("InputNumberComponent", () => {
  let component: InputSliderComponent;
  let fixture: ComponentFixture<InputSliderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InputSliderComponent]
    });
    fixture = TestBed.createComponent(InputSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
