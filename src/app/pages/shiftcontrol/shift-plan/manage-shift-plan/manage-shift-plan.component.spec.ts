import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageShiftPlanComponent } from './manage-shift-plan.component';

describe('ManageShiftPlanComponent', () => {
  let component: ManageShiftPlanComponent;
  let fixture: ComponentFixture<ManageShiftPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageShiftPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageShiftPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
