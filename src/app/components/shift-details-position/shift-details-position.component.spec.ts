import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftDetailsPositionComponent } from './shift-details-position.component';

describe('ShiftDetailsPositionComponent', () => {
  let component: ShiftDetailsPositionComponent;
  let fixture: ComponentFixture<ShiftDetailsPositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftDetailsPositionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftDetailsPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
