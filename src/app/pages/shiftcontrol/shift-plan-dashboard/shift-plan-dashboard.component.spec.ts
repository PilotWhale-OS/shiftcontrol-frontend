import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftPlanDashboardComponent } from './shift-plan-dashboard.component';

describe('ShiftDashboardComponent', () => {
  let component: ShiftPlanDashboardComponent;
  let fixture: ComponentFixture<ShiftPlanDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftPlanDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftPlanDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
