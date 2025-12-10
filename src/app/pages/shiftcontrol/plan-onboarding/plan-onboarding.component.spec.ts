import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PlanOnboardingComponent } from "./plan-onboarding.component";

describe("PlanOnboardingComponent", () => {
  let component: PlanOnboardingComponent;
  let fixture: ComponentFixture<PlanOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanOnboardingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
